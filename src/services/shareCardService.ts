import { auth } from '@/firebase';
import type { ShareCardRecord, ShareCardScope } from '@/ai/schemas';

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

export interface CreateShareCardInput {
  ownerUid: string;
  recipientUid: string;
  scope: ShareCardScope[];
  expiresInDays: number;
  payload: ShareCardRecord['payload'];
}

export const shareCardService = {
  async create(input: CreateShareCardInput): Promise<{ cardId: string }> {
    const response = await fetch('/api/share/create', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Failed to create share card: ${response.status} ${detail}`);
    }
    return response.json();
  },

  async get(cardId: string): Promise<ShareCardRecord> {
    const response = await fetch(`/api/share/get/${encodeURIComponent(cardId)}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (response.status === 410) throw new Error('SHARE_CARD_EXPIRED');
    if (response.status === 403) throw new Error('SHARE_CARD_FORBIDDEN');
    if (!response.ok) throw new Error('Failed to fetch share card');
    return response.json();
  },

  async revoke(cardId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/share/revoke/${encodeURIComponent(cardId)}`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to revoke share card');
    return response.json();
  },

  async listByOwner(ownerUid: string): Promise<ShareCardRecord[]> {
    const response = await fetch(`/api/share/by-owner/${encodeURIComponent(ownerUid)}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to list share cards');
    return response.json();
  },
};
