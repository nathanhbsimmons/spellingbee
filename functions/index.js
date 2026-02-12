import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { onCall } from 'firebase-functions/v2/https'
import admin from 'firebase-admin'
import Anthropic from '@anthropic-ai/sdk'
import { sendJoinCodeEmail } from './utils/emailService.js'

admin.initializeApp()
const db = admin.firestore()

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Trigger: Send join code email when a family is created with an email
export const sendFamilyJoinCode = onDocumentCreated(
  {
    document: 'families/{familyId}',
    region: 'us-central1',
  },
  async (event) => {
    const familyId = event.params.familyId
    const familyData = event.data.data()

    // Gather all emails (prefer emails array, fall back to single email)
    const emails = familyData.emails && Array.isArray(familyData.emails) && familyData.emails.length > 0
      ? familyData.emails
      : familyData.email ? [familyData.email] : []

    if (emails.length === 0) {
      console.log(`Family ${familyId} created without email. Skipping email send.`)
      return
    }

    try {
      console.log(`Sending join code email for family ${familyId} to ${emails.join(', ')}`)

      // Send to all emails
      await Promise.all(emails.map(email =>
        sendJoinCodeEmail({
          email,
          joinCode: familyData.joinCode,
          familyId: familyId,
        })
      ))

      // Update family document with success status
      await db
        .collection('families')
        .doc(familyId)
        .update({
          emailDeliveryStatus: 'success',
          emailLastSentAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      console.log(`Email sent successfully for family ${familyId}`)
    } catch (error) {
      console.error(`Error sending email for family ${familyId}:`, error)

      // Update family document with error status
      try {
        await db
          .collection('families')
          .doc(familyId)
          .update({
            emailDeliveryStatus: 'failed',
            emailLastSentAt: admin.firestore.FieldValue.serverTimestamp(),
            emailError: error.message,
          })
      } catch (updateError) {
        console.error(`Failed to update family ${familyId} with error status:`, updateError)
      }
    }
  }
)

// Callable function: Request join code by email (for join flow on a different device)
export const requestJoinCode = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    const { email } = request.data

    if (!email || !email.includes('@')) {
      throw new Error('A valid email address is required')
    }

    const genericMessage = 'If a family exists with that email, a join code has been sent.'

    try {
      // Try emails array first, fall back to single email field for backward compat
      let snapshot = await db
        .collection('families')
        .where('emails', 'array-contains', email)
        .limit(1)
        .get()

      if (snapshot.empty) {
        snapshot = await db
          .collection('families')
          .where('email', '==', email)
          .limit(1)
          .get()
      }

      if (snapshot.empty) {
        console.log(`No family found for email ${email}. Returning generic message.`)
        return { success: true, message: genericMessage }
      }

      const familyDoc = snapshot.docs[0]
      const newJoinCode = generateJoinCode()

      console.log(`Sending requested join code for family ${familyDoc.id} to ${email}`)

      await db
        .collection('families')
        .doc(familyDoc.id)
        .update({
          joinCode: newJoinCode,
        })

      await sendJoinCodeEmail({
        email: email,
        joinCode: newJoinCode,
        familyId: familyDoc.id,
      })

      await db
        .collection('families')
        .doc(familyDoc.id)
        .update({
          emailDeliveryStatus: 'success',
          emailLastSentAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      console.log(`Join code request email sent for family ${familyDoc.id}`)

      return { success: true, message: genericMessage }
    } catch (error) {
      console.error(`Error processing join code request for ${email}:`, error)
      // Return generic message even on error to avoid leaking info
      return { success: true, message: genericMessage }
    }
  }
)

// Callable function: Resend join code email to current or new email address
export const resendFamilyJoinCode = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    const { familyId, email } = request.data

    // Validate input
    if (!familyId) {
      throw new Error('familyId is required')
    }

    if (!email) {
      throw new Error('email is required')
    }

    // Basic email validation
    if (!email.includes('@')) {
      throw new Error('Invalid email address')
    }

    try {
      // Get family document to verify it exists and get join code
      const familyDoc = await db.collection('families').doc(familyId).get()

      if (!familyDoc.exists) {
        throw new Error('Family not found')
      }

      const newJoinCode = generateJoinCode()

      console.log(`Resending join code email for family ${familyId} to ${email}`)

      // Update family with new join code first
      await db
        .collection('families')
        .doc(familyId)
        .update({
          joinCode: newJoinCode,
        })

      // Send the email with the new code
      await sendJoinCodeEmail({
        email: email,
        joinCode: newJoinCode,
        familyId: familyId,
      })

      // Update family document with success status
      await db
        .collection('families')
        .doc(familyId)
        .update({
          email: email,
          emailDeliveryStatus: 'success',
          emailLastSentAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      console.log(`Resend email successful for family ${familyId}`)

      return {
        success: true,
        message: 'Email sent successfully',
        email: email,
      }
    } catch (error) {
      console.error(`Error resending email for family ${familyId}:`, error)
      throw error
    }
  }
)

// Callable function: Generate context sentences using Claude Haiku
export const generateContextSentences = onCall(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    const { words } = request.data

    if (!words || !Array.isArray(words) || words.length === 0) {
      throw new Error('words must be a non-empty array of strings')
    }

    if (words.length > 30) {
      throw new Error('Maximum 30 words per request')
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    try {
      const client = new Anthropic({ apiKey })

      const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n')

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Generate one short, age-appropriate context sentence for each spelling word below. The sentence should help a child (ages 6-10) understand the word's meaning. Use a blank (___) where the spelling word goes. Return ONLY a JSON object mapping each word to its sentence, with no other text.

Words:
${wordList}

Example format:
{"beautiful": "The sunset was very ___ tonight.", "because": "I stayed inside ___ it was raining."}`,
          },
        ],
      })

      let responseText = message.content[0].text
      // Strip markdown code fences if present (e.g. ```json ... ```)
      responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      const sentences = JSON.parse(responseText)

      return { sentences }
    } catch (error) {
      console.error('Error generating context sentences:', error)
      throw new Error('Failed to generate context sentences')
    }
  }
)
