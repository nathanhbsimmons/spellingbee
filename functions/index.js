import functions from 'firebase-functions'
import admin from 'firebase-admin'
import { sendJoinCodeEmail } from './utils/emailService.js'

admin.initializeApp()
const db = admin.firestore()

// Trigger: Send join code email when a family is created with an email
export const sendFamilyJoinCode = functions
  .region('us-central1')
  .firestore.document('families/{familyId}')
  .onCreate(async (snap, context) => {
    const { familyId } = context.params
    const familyData = snap.data()

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
  })

// Callable function: Resend join code email to current or new email address
export const resendFamilyJoinCode = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    const { familyId, email } = data

    // Validate input
    if (!familyId) {
      throw new functions.https.HttpsError('invalid-argument', 'familyId is required')
    }

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'email is required')
    }

    // Basic email validation
    if (!email.includes('@')) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address')
    }

    try {
      // Get family document to verify it exists and get join code
      const familyDoc = await db.collection('families').doc(familyId).get()

      if (!familyDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Family not found')
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

      // If it's already an HttpsError, rethrow it
      if (error instanceof functions.https.HttpsError) {
        throw error
      }

      // Otherwise, convert to internal error
      throw new functions.https.HttpsError('internal', error.message || 'Failed to send email')
    }
  })
