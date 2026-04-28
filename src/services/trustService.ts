import { auth } from '@/firebase';

const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const trustService = {
  async report(reporterId: string, targetId?: string, reason?: string, note?: string, evidence?: any) {
    const response = await fetch('/api/safety/report', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ reporterId, targetId, reason, note, evidence }),
    });
    if (!response.ok) throw new Error('Failed to submit report');
    return response.json();
  },

  async block(blockerId: string, blockedId: string) {
    const response = await fetch('/api/safety/block', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ blockerId, blockedId }),
    });
    if (!response.ok) throw new Error('Failed to block user');
    return response.json();
  },

  async unmatch(unmatcherId: string, targetId: string, matchId?: string) {
    const response = await fetch('/api/safety/unmatch', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ unmatcherId, targetId, matchId }),
    });
    if (!response.ok) throw new Error('Failed to unmatch');
    return response.json();
  },

  async pauseProfile(userId: string, paused: boolean) {
    const response = await fetch('/api/profile/pause', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ userId, paused }),
    });
    if (!response.ok) throw new Error('Failed to pause profile');
    return response.json();
  },

  async requestAccountDeletion(userId: string, reason?: string) {
    const response = await fetch('/api/account/delete-request', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ userId, reason }),
    });
    if (!response.ok) throw new Error('Failed to request account deletion');
    return response.json();
  },

  async contactSupport(userId: string, message: string, type: string) {
    const response = await fetch('/api/support/contact', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ userId, message, type }),
    });
    if (!response.ok) throw new Error('Failed to contact support');
    return response.json();
  },
  async updatePrivacySettings(userId: string, settings: any) {
    const response = await fetch('/api/profile/privacy', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ userId, settings }),
    });
    if (!response.ok) throw new Error('Failed to update privacy settings');
    return response.json();
  },

  async resetPersonalityAssessment(userId: string) {
    const response = await fetch('/api/profile/personality/reset', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to reset personality assessment');
    return response.json();
  },

  async deletePersonalityData(userId: string) {
    const response = await fetch('/api/profile/personality/delete', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to delete personality data');
    return response.json();
  },
};
