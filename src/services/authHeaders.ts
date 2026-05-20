import { auth } from '@/firebase';

export const LOCAL_MOCK_AUTH_STORAGE_KEY = 'kesher.localMockAuth';
export const LOCAL_MOCK_AUTH_HEADER = 'X-Kesher-Mock-Auth';

export function isLocalDevMockAuthEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_KESHER_ENABLE_MOCK_AUTH !== 'false';
}

export function hasLocalMockAuthSession(): boolean {
  if (!isLocalDevMockAuthEnabled() || typeof window === 'undefined') return false;
  return window.localStorage.getItem(LOCAL_MOCK_AUTH_STORAGE_KEY) === 'true';
}

export function setLocalMockAuthSession(enabled: boolean): void {
  if (!isLocalDevMockAuthEnabled() || typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(LOCAL_MOCK_AUTH_STORAGE_KEY, 'true');
  } else {
    window.localStorage.removeItem(LOCAL_MOCK_AUTH_STORAGE_KEY);
  }
}

export async function buildJsonAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  } else if (hasLocalMockAuthSession()) {
    headers[LOCAL_MOCK_AUTH_HEADER] = 'local-dev';
  }

  return headers;
}
