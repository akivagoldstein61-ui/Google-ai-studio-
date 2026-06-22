import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from 'firebase/firestore';
import fs from 'fs';

const configPath = './firebase-applet-config.json';
let db: any = null;

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const app = initializeApp(config, 'consentVerificationApp');
  db = getFirestore(app, config.firestoreDatabaseId);
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: config.projectId });
  }
}

const hasActiveShareCard = async (ownerUid: string, recipientUid: string) => {
  if (!db) return false;

  const shareQuery = query(
    collection(db, 'shareCards'),
    where('ownerUid', '==', ownerUid),
    where('recipientUid', '==', recipientUid),
  );
  const snap = await getDocs(shareQuery);
  return snap.docs.some((docSnap) => {
    const data = docSnap.data();
    return !data.revokedAt;
  });
};

export async function verifyBilateralShareConsent(
  uidA: string,
  uidB: string,
): Promise<boolean> {
  if (!uidA || !uidB || uidA === uidB) return false;

  const [aToB, bToA] = await Promise.all([
    hasActiveShareCard(uidA, uidB),
    hasActiveShareCard(uidB, uidA),
  ]);

  return aToB && bToA;
}
