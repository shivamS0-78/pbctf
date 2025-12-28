/**
 * Firebase Client SDK Configuration
 * Handles client-side authentication with automatic token refresh
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
}

/**
 * Get current Firebase auth token
 * Firebase automatically refreshes the token if it's expired
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Firebase SDK automatically refreshes the token if expired
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out
 */
export async function signOutUser() {
  return signOut(auth);
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  return auth.currentUser;
}

/**
 * Wait for auth to initialize
 */
export function onAuthStateChanged(callback: (user: User | null) => void) {
  if (typeof window === 'undefined') return () => {};
  
  return auth.onAuthStateChanged(callback);
}

export { auth };

