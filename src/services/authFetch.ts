import { auth } from '@/firebase';

/**
 * Thin wrapper around fetch that attaches the Firebase ID token
 * as a Bearer token in the Authorization header.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  const headers = new Headers(options.headers);

  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('Content-Type', 'application/json');
  return fetch(url, { ...options, headers });
}
