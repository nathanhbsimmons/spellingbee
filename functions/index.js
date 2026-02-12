import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { onCall } from 'firebase-functions/v2/https'
import admin from 'firebase-admin'
import { sendJoinCodeEmail } from './utils/emailService.js'

admin.initializeApp()
const db = admin.firestore()

// Trigger: Send join code email when a family is created with an email
export const sendFamilyJoinCode = onDocumentCreated(
  {
    document: 'families/{familyId}',
    region: 'us-central1',
  },
  async (event) => {
    const familyId = event.params.familyId
    const familyData = event.data.data()

    // Skip if no email provided
    if (!familyData.email) {
      console.log(`Family ${familyId} created without email. Skipping email send.`)
      return
    }

    try {
      console.log(`Sending join code email for family ${familyId} to ${familyData.email}`)

      // Send the email
      await sendJoinCodeEmail({
        email: familyData.email,
        joinCode: familyData.joinCode,
        familyId: familyId,
      })

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
      const snapshot = await db
        .collection('families')
        .where('email', '==', email)
        .limit(1)
        .get()

      if (snapshot.empty) {
        console.log(`No family found for email ${email}. Returning generic message.`)
        return { success: true, message: genericMessage }
      }

      const familyDoc = snapshot.docs[0]
      const familyData = familyDoc.data()

      console.log(`Sending requested join code for family ${familyDoc.id} to ${email}`)

      await sendJoinCodeEmail({
        email: email,
        joinCode: familyData.joinCode,
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

      const familyData = familyDoc.data()

      console.log(`Resending join code email for family ${familyId} to ${email}`)

      // Send the email
      await sendJoinCodeEmail({
        email: email,
        joinCode: familyData.joinCode,
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
