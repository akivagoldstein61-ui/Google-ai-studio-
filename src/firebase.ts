import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import rawConfig from '../firebase-applet-config.json';

// Separate the Kesher-specific firestoreDatabaseId from the standard Firebase config
const { firestoreDatabaseId, ...firebaseConfig } = rawConfig;

const app = initializeApp(firebaseConfig);

// App Check — production: required, prototype: skipped
// Set VITE_RECAPTCHA_ENTERPRISE_KEY in Vercel env to enable.
let appCheck: AppCheck | undefined;
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY;
if (typeof window !== 'undefined' && recaptchaKey) {
  try {
    // Debug token for local dev — only enable in dev mode
    if (import.meta.env.DEV) {
      // @ts-expect-error: debug-only global, not in types
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn('App Check init failed:', e);
  }
}

export { appCheck };
export const auth = getAuth(app);
// Connect to the named Firestore database if specified, otherwise fall back to (default)
export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);
