/*
FIREBASE SETUP REQUIRED FOR PRODUCTION USE

To get this working with real data persistence, follow these steps:

1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Name it "baumprofis-invoice-platform"
4. Enable Google Analytics (recommended for small business)
5. Choose a Google Analytics account
6. Project created - now enable services:

AUTHENTICATION:
- Go to Authentication > Get started
- Go to Sign-in method tab
- Enable "Email/Password" sign-in provider

FIRESTORE DATABASE:
- Go to Firestore Database > Create database
- Choose "Start in test mode" (you can secure it later)
- Select a location (europe-west for Germany)

GET CONFIG VALUES:
- Go to Project settings (gear icon)
- Scroll down to "Your apps" section
- Click "Add app" > Web app (</>)
- Register with name "Baumprofis Invoice Web"
- Copy the config object below

REPLACE THE CONFIG BELOW WITH YOUR REAL VALUES
*/

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ⚠️ DEVELOPMENT CONFIG - REPLACE WITH REAL FIREBASE PROJECT VALUES
// SEE INSTRUCTIONS ABOVE
const firebaseConfig = {
  apiKey: "AIzaSyBBA05JFG8GFTzWXP3Ua7kjQcNUcH3ysNE",
  authDomain: "baumprofis-invoice-platf-3a831.firebaseapp.com",
  projectId: "baumprofis-invoice-platf-3a831",
  storageBucket: "baumprofis-invoice-platf-3a831.firebasestorage.app",
  messagingSenderId: "644966181824",
  appId: "1:644966181824:web:3e01166d1ecd993c647625",
  measurementId: "G-3GRMNFXLBZ"
};

console.warn(`
🚨 FIREBASE NOT CONFIGURED 🚨

This app is running in development mode with dummy Firebase keys.
To enable authentication and data persistence:

1. Follow the instructions above to create a Firebase project
2. Replace the firebaseConfig values in src/lib/firebase.ts
3. Restart the development server

Until then, you can still explore the UI but login/authentication won't work.
`)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
