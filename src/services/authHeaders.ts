import { auth } from '@/firebase';

const LOCAL_MOCK_AUTH_KEY = 'KESHER_LOCAL_MOCK_AUTH';

export async function buildAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  if (import.meta.env.DEV && localStorage.getItem(LOCAL_MOCK_AUTH_KEY) === '1') {
    headers['x-kesher-mock-auth'] = 'local-dev-user';
  }

  return headers;
}
