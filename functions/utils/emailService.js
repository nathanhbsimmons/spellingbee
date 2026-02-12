import nodemailer from 'nodemailer'

let transporter = null

function initializeTransporter() {
  if (transporter) {
    return transporter
  }

  const gmailEmail = process.env.GMAIL_EMAIL
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailEmail || !gmailPassword) {
    throw new Error('Gmail credentials not configured. Set GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables.')
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  })

  return transporter
}

function generateEmailTemplate(joinCode, appUrl = null) {
  const baseUrl = appUrl || 'https://spellingbee.example.com'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 40px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          h1 {
            color: #7c3aed;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .code-box {
            background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
            border: 2px solid #ddd6fe;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .code-box p {
            margin: 0;
            font-size: 48px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
          }
          .code-label {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
          }
          .instructions {
            background-color: #f9f9f9;
            border-left: 4px solid #7c3aed;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .instructions h2 {
            color: #7c3aed;
            margin-top: 0;
            font-size: 16px;
          }
          .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            font-size: 14px;
          }
          .app-link {
            text-align: center;
            margin: 30px 0;
          }
          .app-link a {
            display: inline-block;
            background-color: #7c3aed;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: bold;
          }
          .app-link a:hover {
            background-color: #6d28d9;
          }
          .footer {
            border-top: 1px solid #eee;
            margin-top: 40px;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Spelling Word Collector</h1>
            <p style="color: #666; margin: 10px 0;">Your Family Join Code</p>
          </div>

          <p style="font-size: 16px; color: #333;">
            Welcome to Spelling Word Collector! To sync your spelling practice across devices, use this code:
          </p>

          <div class="code-box">
            <p>${joinCode}</p>
            <p class="code-label">6-character join code</p>
          </div>

          <div class="instructions">
            <h2>How to use this code:</h2>
            <ol>
              <li>Open Spelling Word Collector on another device</li>
              <li>Select "Join Existing Family"</li>
              <li>Enter the code above: <strong>${joinCode}</strong></li>
              <li>Your devices will now sync automatically!</li>
            </ol>
          </div>

          <p style="font-size: 14px; color: #666;">
            <strong>Keep this code safe!</strong> Share it only with family members who want to join your practice group.
          </p>

          ${baseUrl ? `
          <div class="app-link">
            <a href="${baseUrl}">Open Spelling Word Collector</a>
          </div>
          ` : ''}

          <div class="footer">
            <p>Spelling Word Collector - Making spelling practice anxiety-free</p>
            <p>No real-time grading, just joyful learning and family collaboration</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function sendJoinCodeEmail({ email, joinCode, familyId, appUrl = null }) {
  if (!email) {
    throw new Error('Email address is required')
  }

  const transporter = initializeTransporter()
  const htmlContent = generateEmailTemplate(joinCode, appUrl)

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: `Your Spelling Word Collector Join Code: ${joinCode}`,
      html: htmlContent,
    })

    console.log(`Email sent successfully to ${email}. Message ID: ${info.messageId}`)
    return {
      success: true,
      messageId: info.messageId,
      email,
      familyId,
    }
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message)
    throw new Error(`Email delivery failed: ${error.message}`)
  }
}
