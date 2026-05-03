import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

// Separate the Kesher-specific firestoreDatabaseId from the standard Firebase config
const { firestoreDatabaseId, ...firebaseConfig } = rawConfig;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Connect to the named Firestore database if specified, otherwise fall back to (default)
export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);
