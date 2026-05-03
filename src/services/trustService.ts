import { auth } from '@/firebase';
import { isPrototypeDemoMode } from '@/lib/prototypeMode';

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

const demoResponse = (payload: Record<string, any> = {}) => ({ success: true, demoMode: true, ...payload });

const postJson = async (url: string, body: Record<string, any>) => {
  if (isPrototypeDemoMode()) {
    return demoResponse();
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json();
};

export const trustService = {
  async report(reporterId: string, targetId?: string, reason?: string, note?: string, evidence?: any) {
    return postJson('/api/safety/report', { reporterId, targetId, reason, note, evidence });
  },

  async block(blockerId: string, blockedId: string) {
    return postJson('/api/safety/block', { blockerId, blockedId });
  },

  async unmatch(unmatcherId: string, targetId: string, matchId?: string) {
    return postJson('/api/safety/unmatch', { unmatcherId, targetId, matchId });
  },

  async pauseProfile(userId: string, paused: boolean) {
    return postJson('/api/profile/pause', { userId, paused });
  },

  async requestAccountDeletion(userId: string, reason?: string) {
    return postJson('/api/account/delete-request', { userId, reason });
  },

  async contactSupport(userId: string, message: string, type: string) {
    return postJson('/api/support/contact', { userId, message, type });
  },

  async updatePrivacySettings(userId: string, settings: any) {
    return postJson('/api/profile/privacy', { userId, settings });
  },

  async resetPersonalityAssessment(userId: string) {
    return postJson('/api/profile/personality/reset', { userId });
  },

  async deletePersonalityData(userId: string) {
    return postJson('/api/profile/personality/delete', { userId });
  },

  async exportPersonalityData(userId: string) {
    if (isPrototypeDemoMode()) {
      return demoResponse({
        exportedAt: new Date().toISOString(),
        profile: { userId, note: 'Demo mode export payload.' },
      });
    }
    return postJson('/api/profile/personality/export', { userId });
  },

  async getPersonalityVisibility(userId: string) {
    if (isPrototypeDemoMode()) {
      return demoResponse({
        fields: {
          trait_summary: 'private',
          strengths: 'private',
          watch_outs: 'private',
          communication_notes: 'private',
        },
      });
    }
    return postJson('/api/profile/personality/visibility', { userId });
  },

  async updatePersonalityVisibility(userId: string, fields: Record<string, 'private' | 'public' | 'mutual'>) {
    return postJson('/api/profile/personality/visibility/update', { userId, fields });
  },
};
