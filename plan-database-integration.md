# Plan: Database Integration for Cross-Device Persistence

## Answering Your Questions First

### Will GitHub Pages support a fullstack application?

**No.** GitHub Pages is static-only hosting — it serves HTML, CSS, and JS files but cannot run a server or database. You'd need a separate backend service for the database, which means either:
- A hosted backend (API) that the GitHub Pages frontend calls, or
- Moving to a hosting platform that supports both frontend and backend

### What's the simplest, lowest-effort way to host this?

**Recommended: Firebase (Firestore + Firebase Hosting)**

Firebase is the best fit for this project because:
- **No server to write or maintain** — Firestore is accessed directly from the browser using the Firebase JS SDK, so you don't need to build an API/backend at all
- **Free tier is generous** — Firestore's free tier allows 50K reads/day and 20K writes/day, which is orders of magnitude more than a spelling app needs
- **Firebase Hosting** replaces GitHub Pages for serving the static frontend (one command deploy via `firebase deploy`)
- **Built-in auth** — Firebase Auth can handle the parent PIN / profile system with zero backend code
- **Realtime sync** — Firestore automatically syncs data across devices in realtime, so if a parent adds words on one device, they appear immediately on another

**Alternatives considered:**
| Option | Pros | Cons |
|--------|------|------|
| **Firebase** | No backend code, free tier, realtime sync, simple auth | Vendor lock-in to Google |
| **Supabase** | Open source, PostgreSQL, generous free tier | Slightly more complex setup, SQL instead of document model |
| **Railway/Render + SQLite** | Full control | Must write and maintain a backend API server |
| **Cloudflare Workers + D1** | Very cheap, edge-deployed | More complex developer experience |

Firebase wins on simplicity since the app's data model (profiles, word lists, sessions) maps naturally to Firestore's document/collection model, and you avoid writing any backend code.

---

## Implementation Plan

### Step 1: Firebase Project Setup

- Create a Firebase project in the Firebase Console
- Enable Firestore Database
- Enable Firebase Hosting
- Enable Firebase Auth (Anonymous auth for simplicity — no login required, just device-linked identity)
- Install the Firebase SDK: `npm install firebase`
- Create `src/firebase.js` with project config and initialization

### Step 2: Design Firestore Data Model

```
/families/{familyId}
  ├── pin: string (hashed)
  ├── createdAt: timestamp
  │
  ├── /profiles/{profileId}
  │     ├── name: string
  │     ├── createdAt: timestamp
  │
  ├── /wordLists/{listId}
  │     ├── name: string
  │     ├── words: string[]
  │     ├── sentences: map
  │     ├── createdAt: timestamp
  │
  ├── /sessions/{sessionId}
  │     ├── profileId: string
  │     ├── listName: string
  │     ├── words: string[]
  │     ├── typedWords: string[]
  │     ├── theme: string
  │     ├── mode: string
  │     ├── completedAt: timestamp
  │
  └── /streaks/{profileId}
        ├── count: number
        ├── lastDate: string
```

Everything lives under a `families` document. This groups all data for one family. To link devices to the same family, you'd use a simple "family code" — a short join code the parent creates once and enters on each device.

### Step 3: Create `src/db.js` — Firestore Data Layer

Replace the localStorage calls with Firestore equivalents. The new module mirrors the existing `storage.js` API:

- `loadWordLists(familyId)` → query `families/{id}/wordLists`
- `createWordList(familyId, name, words, sentences)` → add doc
- `updateWordList(familyId, listId, updates)` → update doc
- `deleteWordList(familyId, listId)` → delete doc
- `loadSessions(familyId, profileId?)` → query `families/{id}/sessions`
- `saveSession(familyId, session)` → add doc
- `loadProfiles(familyId)` → query `families/{id}/profiles`
- `createProfile(familyId, name)` → add doc
- `deleteProfile(familyId, profileId)` → delete doc
- `getStreak(familyId, profileId)` / `updateStreak(...)` → get/set doc
- `getPin(familyId)` / `setPin(...)` → read/write family doc
- `createFamily()` → create family doc, return join code
- `joinFamily(code)` → look up family by code, return familyId

### Step 4: Create Family Join Flow

Add a new screen at app startup (before profile selection):

1. **First launch**: "Create a new family or join an existing one?"
   - **Create**: generates a family, shows a 6-character join code (stored in localStorage too for convenience)
   - **Join**: enter the join code from another device
2. Store the `familyId` in localStorage so the user doesn't re-enter it every time
3. This is the mechanism that links multiple devices to the same data

### Step 5: Refactor Components to Use `db.js`

Update each component that currently imports from `storage.js`:

| Component | Current storage calls | Change needed |
|-----------|----------------------|---------------|
| `App.jsx` | `hasSeenWelcome`, `dismissWelcome`, profiles, active profile | Add familyId context, async data loading |
| `AdminPanel.jsx` | `loadWordLists`, `createWordList`, `updateWordList`, `deleteWordList`, `getPin`, `setPin`, `verifyPin` | Switch to `db.js` calls, add loading states |
| `WordListSetup.jsx` | `loadWordLists`, `loadSessions`, `getStreak` | Switch to `db.js`, add loading states |
| `ProfileSelector.jsx` | `loadProfiles`, `createProfile`, `deleteProfile`, `setActiveProfile` | Switch to `db.js` |
| `Practice.jsx` | None (in-memory during practice) | No change needed |
| `Complete.jsx` | `saveSession` | Switch to `db.js` |

Key refactoring pattern:
- All Firestore calls are async, so components need loading states
- Wrap the app in a `FamilyContext` provider that holds the `familyId`
- Keep `hasSeenWelcome` / `dismissWelcome` in localStorage (device-local preference, not shared data)
- Keep `activeProfile` in localStorage (which profile is selected is per-device)

### Step 6: Add Loading States

Since Firestore calls are async (unlike localStorage which is synchronous), add simple loading indicators:
- Show a spinner or "Loading..." while data fetches on screen transitions
- Keep the Practice screen fully synchronous (it already works in-memory) — only write to Firestore when the session completes

### Step 7: Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId}/{document=**} {
      // Anyone with the familyId can read/write
      // This is acceptable because familyId is a random UUID
      // and the app is for a family, not public users
      allow read, write: if true;
    }
  }
}
```

For a family spelling app, security-by-obscurity (random family IDs) is sufficient. The join code is short for human entry, but the actual familyId in Firestore is a full UUID.

### Step 8: Update Deployment

- Remove or keep the GitHub Actions workflow (optional — could keep GitHub Pages as a fallback)
- Add `firebase.json` for Firebase Hosting config
- Update `vite.config.js` base path from `/spellingbee/` to `/`
- Deploy with `firebase deploy`

### Step 9: Migration Path for Existing Data

Add a one-time migration prompt:
- On first launch after the update, detect if localStorage has existing data
- Offer: "You have existing word lists and history. Import them to your new family?"
- If yes, write all localStorage data to Firestore under the new family
- This ensures no data is lost during the transition

---

## What Changes, What Stays the Same

| Aspect | Before | After |
|--------|--------|-------|
| Data storage | localStorage | Firestore |
| Hosting | GitHub Pages | Firebase Hosting |
| Cross-device | No | Yes, via family join code |
| Backend code | None | None (Firestore SDK is client-side) |
| Auth | Parent PIN in localStorage | Parent PIN in Firestore + optional Firebase Auth |
| Practice mode | In-memory | In-memory (unchanged) |
| Build tool | Vite | Vite (unchanged) |
| Framework | React | React (unchanged) |
| Cost | Free | Free (Firebase free tier) |

## Files to Create/Modify

**New files:**
- `src/firebase.js` — Firebase config and initialization
- `src/db.js` — Firestore data access layer (replaces storage.js)
- `src/contexts/FamilyContext.jsx` — React context for familyId
- `src/components/FamilySetup.jsx` — Create/join family screen
- `firebase.json` — Firebase Hosting config
- `.firebaserc` — Firebase project link
- `firestore.rules` — Security rules

**Modified files:**
- `package.json` — add `firebase` dependency
- `vite.config.js` — update base path
- `src/App.jsx` — add FamilyContext provider, family setup flow
- `src/components/AdminPanel.jsx` — async Firestore calls
- `src/components/WordListSetup.jsx` — async Firestore calls
- `src/components/ProfileSelector.jsx` — async Firestore calls
- `src/components/Complete.jsx` — async Firestore calls
- `src/storage.js` — keep for device-local prefs only (welcome seen, active profile)

**Tests to update:**
- All component tests that mock `storage.js` will need to mock `db.js` instead
- Add tests for `db.js` (can mock the Firebase SDK)
- Add test for FamilySetup component
