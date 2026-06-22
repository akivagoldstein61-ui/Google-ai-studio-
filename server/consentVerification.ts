import type { Firestore } from 'firebase-admin/firestore';
import { getOptionalAdminFirestore } from './firebaseAdmin.ts';

let db: Firestore | null = null;

const hasActiveShareCard = async (ownerUid: string, recipientUid: string) => {
  db ??= getOptionalAdminFirestore();
  if (!db) return false;

  const snap = await db
    .collection('shareCards')
    .where('ownerUid', '==', ownerUid)
    .where('recipientUid', '==', recipientUid)
    .where('revokedAt', '==', null)
    .get();
  return !snap.empty;
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
