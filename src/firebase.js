// Fill in the real values in your .env file (copy .env.example -> .env).
// Get these from Firebase console: Project settings -> General -> Your apps -> Web app.
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported as messagingIsSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Email/password auth (not anonymous) on purpose: an anonymous account gets a new
// random ID every time you reinstall the app or clear its storage, which would
// silently orphan all your bills. A real account is the same account on every device.
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function logOut() {
  return signOut(auth);
}

export async function getMessagingIfSupported() {
  const supported = await messagingIsSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
}
