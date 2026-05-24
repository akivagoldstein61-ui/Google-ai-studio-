import admin from 'firebase-admin';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

function normalizedPrivateKey(): string | undefined {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

export function hasFirebaseAdminCredentialConfig(): boolean {
  return Boolean(
    (process.env.FIREBASE_CLIENT_EMAIL && normalizedPrivateKey()) ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      process.env.FIREBASE_ADMIN_ALLOW_APP_DEFAULT === 'true',
  );
}

export function ensureFirebaseAdminInitialized() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizedPrivateKey();
  const options: admin.AppOptions = { projectId };

  if (clientEmail && privateKey) {
    options.credential = admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  return admin.initializeApp(options);
}

export function getAdminFirestore() {
  const app = ensureFirebaseAdminInitialized();
  const databaseId = process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;
  return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export function getOptionalAdminFirestore() {
  if (!hasFirebaseAdminCredentialConfig()) return null;
  return getAdminFirestore();
}

export { admin, FieldValue };
