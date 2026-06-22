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
    .get();
  return snap.docs.some((docSnap) => {
    const data = docSnap.data();
    return data.revokedAt === null;
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
