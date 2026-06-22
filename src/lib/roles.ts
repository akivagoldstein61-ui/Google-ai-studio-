import type { Profile } from '@/types';

/**
 * Client-side mirror of the `firestore.rules` `isAdmin()` role branch.
 *
 * Fail-closed: anything other than an explicit `'admin'` role is treated as
 * non-admin. This only governs whether operator UI is reachable in the client;
 * the server (`authMiddleware` + `firestore.rules`) remains the authoritative
 * security boundary. The rules also grant admin to a specific verified owner
 * email — that is a server-side superuser path and is intentionally not
 * mirrored here, so the UI guard can only ever be stricter than the server.
 */
export const isAdminUser = (user: Pick<Profile, 'role'> | null | undefined): boolean =>
  user?.role === 'admin';

/**
 * Pure decision for whether the operator (`/admin/*`) surface may be shown.
 * Admins always may; demo mode may (non-production, view-only, mock-data).
 * Everything else is fail-closed. Extracted so it can be unit-tested without
 * rendering React or touching `window`.
 */
export const canViewAdminSurface = (
  user: Pick<Profile, 'role'> | null | undefined,
  isDemoMode: boolean,
): boolean => isDemoMode || isAdminUser(user);
