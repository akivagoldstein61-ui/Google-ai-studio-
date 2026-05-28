import { auth } from '@/firebase';

async function getJsonHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  return headers;
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(await getJsonHeaders()),
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Discovery API error ${response.status}`);
  return response.json();
}

export const discoveryService = {
  getTasteProfile() {
    return apiFetch('/api/taste/profile');
  },

  resetTasteProfile() {
    return apiFetch('/api/taste/reset', { method: 'POST', body: JSON.stringify({}) });
  },

  exportTasteProfile() {
    return apiFetch('/api/taste/export');
  },

  deleteTasteProfile() {
    return apiFetch('/api/taste/delete', { method: 'POST', body: JSON.stringify({}) });
  },

  recordTasteEvent(name: string, candidateId?: string) {
    return apiFetch('/api/taste/events', {
      method: 'POST',
      body: JSON.stringify({ name, candidateId }),
    });
  },

  getDailyPicks() {
    return apiFetch('/api/discovery/daily-picks');
  },

  getExploreProfiles() {
    return apiFetch('/api/discovery/explore');
  },

  likeProfile(profileId: string) {
    return apiFetch('/api/discovery/like', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    });
  },

  passProfile(profileId: string) {
    return apiFetch('/api/discovery/pass', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    });
  },
};
