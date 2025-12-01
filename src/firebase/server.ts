'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// This is a server-only module.
// It initializes Firebase and provides SDK instances for server-side operations.

let firebaseApp: FirebaseApp;

// Check if Firebase is already initialized
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);

/**
 * Returns server-side instances of the Firebase SDKs.
 */
export function getSdks() {
  return {
    firebaseApp,
    auth,
    firestore,
  };
}
