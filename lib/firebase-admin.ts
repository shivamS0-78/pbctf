import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// For production: Use service account credentials from environment variables
// For development: Uses application default credentials or can work without full verification

const getFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // Check if we have service account credentials
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    // Full credentials available - use them
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback: Initialize with just project ID (limited functionality)
  if (projectId) {
    return admin.initializeApp({
      projectId,
    });
  }

  throw new Error('Firebase Admin SDK requires at least FIREBASE_PROJECT_ID to be set');
};

// Lazy initialization
let firebaseAdmin: admin.app.App | null = null;

export const getAdmin = () => {
  if (!firebaseAdmin) {
    firebaseAdmin = getFirebaseAdmin();
  }
  return firebaseAdmin;
};

export const getAuth = () => {
  return getAdmin().auth();
};

export default admin;
