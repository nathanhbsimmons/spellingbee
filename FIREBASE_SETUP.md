# Firebase Setup Guide

This guide will help you set up Firebase for the Spelling Word Collector app to enable cross-device data synchronization.

## Prerequisites

- Node.js installed
- A Google account (for Firebase Console access)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or "Create a project")
3. Enter a project name (e.g., "spelling-word-collector")
4. Disable Google Analytics (not needed for this app) or keep it enabled if you prefer
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web** icon (`</>`) to add a web app
2. Enter an app nickname (e.g., "Spelling Word Collector Web")
3. **Do NOT** check "Also set up Firebase Hosting" (we'll do this manually)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this in Step 4)

## Step 3: Enable Firestore Database

1. In the Firebase Console, go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose "Start in **production mode**"
4. Select a Firestore location (choose the one closest to you)
5. Click "Enable"

## Step 4: Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase configuration values from Step 2:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 5: Update Firebase Project ID

1. Open `.firebaserc` in the project root
2. Replace `YOUR_PROJECT_ID` with your actual Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

## Step 6: Deploy Firestore Security Rules

1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Deploy the Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 7: Test Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser and test:
   - Create a new family
   - Add some word lists
   - Create profiles
   - The join code should appear after creating a family

## Step 8: Deploy to Firebase Hosting

1. Build the production app:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

3. Your app will be live at:
   ```
   https://your-project-id.web.app
   ```

## Testing Cross-Device Sync

1. On Device 1: Create a family and note the 6-character join code
2. On Device 2: Open the app and choose "Join Existing Family"
3. Enter the join code from Device 1
4. Both devices should now see the same data (word lists, profiles, sessions)

## Security Notes

- The Firestore security rules allow any authenticated user to read/write to family documents
- Security is provided by the obscurity of the randomly-generated family ID (UUID)
- The 6-character join code is stored in the family document and used to find the family by code
- For a production app with sensitive data, you would want to implement proper Firebase Authentication

## Troubleshooting

### "Permission denied" errors in Firestore
- Make sure you deployed the security rules: `firebase deploy --only firestore:rules`
- Check that the rules file (`firestore.rules`) is properly formatted

### Environment variables not loading
- Make sure your `.env` file is in the project root
- Restart the development server after changing `.env`
- Verify variable names start with `VITE_` (required for Vite)

### Build fails
- Clear the `dist` folder and rebuild: `rm -rf dist && npm run build`
- Check that all Firebase environment variables are set

### Join code not working
- Verify both devices are connected to the internet
- Check that the join code is entered in UPPERCASE
- Make sure Firestore is enabled in the Firebase Console

## Migration from localStorage

When users first open the app after the Firebase update:
- If they have existing word lists/profiles in localStorage, they'll see a migration prompt
- They can choose to import their data or start fresh
- Migration happens automatically when creating a new family
- Original localStorage data is preserved even after migration

## Cost

Firebase offers a generous free tier:
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 1 GB storage
- **Hosting**: 10 GB transfer/month, 360 MB/day

For a family spelling app, you'll stay well within the free tier limits.

## Support

For issues related to:
- Firebase setup → Check [Firebase Documentation](https://firebase.google.com/docs)
- App functionality → Open an issue on the project repository
