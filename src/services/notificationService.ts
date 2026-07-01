/**
 * Kesher Notification Service (client-side)
 *
 * Manages notification preferences and FCM token registration.
 * No sensitive data is ever included in notification previews.
 */
import { authFetch } from './authFetch';

export interface NotificationPreferences {
  uid: string;
  p1_match_new: boolean;
  p1_message_new: boolean;
  p1_consent_change: boolean;
  p2_date_reminder: boolean;
  p3_engagement_nudge: boolean;
  fcmToken: string | null;
  updatedAt: string;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  try {
    const res = await authFetch('/api/notifications/preferences');
    const data = await res.json();
    return data.ok ? data.preferences : null;
  } catch {
    return null;
  }
}

export async function updateNotificationPreferences(
  updates: Partial<Pick<NotificationPreferences,
    'p1_match_new' | 'p1_message_new' | 'p1_consent_change' |
    'p2_date_reminder' | 'p3_engagement_nudge'
  >>
): Promise<NotificationPreferences | null> {
  try {
    const res = await authFetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data.ok ? data.preferences : null;
  } catch {
    return null;
  }
}

export async function registerFcmToken(fcmToken: string): Promise<boolean> {
  try {
    const res = await authFetch('/api/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function getDeliveryLog(): Promise<unknown[]> {
  try {
    const res = await authFetch('/api/notifications/delivery-log');
    const data = await res.json();
    return data.ok ? data.records : [];
  } catch {
    return [];
  }
}

export const NOTIFICATION_LABELS: Record<string, string> = {
  p1_match_new: 'New matches',
  p1_message_new: 'New messages',
  p1_consent_change: 'Consent & sharing changes',
  p2_date_reminder: 'Date reminders',
  p3_engagement_nudge: 'Activity suggestions',
};

export const NOTIFICATION_DESCRIPTIONS: Record<string, string> = {
  p1_match_new: 'Get notified when someone new matches with you.',
  p1_message_new: 'Get notified when a match sends you a message.',
  p1_consent_change: 'Get notified when a shared insight is updated or revoked.',
  p2_date_reminder: 'Get a reminder before a planned date.',
  p3_engagement_nudge: 'Occasional suggestions to revisit your picks.',
};
