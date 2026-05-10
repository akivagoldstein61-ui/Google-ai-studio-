/**
 * Notification service — in-app inbox + browser-level toasts.
 *
 * Notifications are stored in Firestore under /notifications/{notifId} with
 * a `userId` field. The UI subscribes to the current user's notifications
 * via `subscribeToNotifications`.
 *
 * Browser permission is requested lazily — only after the user opts in via
 * the AI Trust Hub setting. We do not auto-prompt on first load.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase";
import { isPrototypeDemoMode } from "@/lib/prototypeMode";

export type NotificationKind =
  | "new_match"
  | "new_message"
  | "consent_request"
  | "consent_granted"
  | "safety_action"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const PERMISSION_KEY = "kesher_browser_notif_permission_v1";

export const notificationService = {
  /**
   * Subscribe to the user's notifications (newest first, up to 50).
   */
  subscribeToNotifications(
    uid: string,
    callback: (notifications: AppNotification[]) => void,
  ): Unsubscribe {
    if (isPrototypeDemoMode()) {
      // Demo: synthesize a sample notification
      setTimeout(() => {
        callback([
          {
            id: "demo_notif_1",
            userId: uid,
            kind: "new_match",
            title: "התאמה חדשה",
            body: "יש לכם שיחה לפתוח.",
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 800);
      return () => {};
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    return onSnapshot(
      q,
      (snap) => {
        const items: AppNotification[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.userId,
            kind: data.kind,
            title: data.title,
            body: data.body,
            link: data.link,
            read: !!data.read,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString?.() ??
              data.createdAt ??
              new Date().toISOString(),
          };
        });
        callback(items);
      },
      (err) => console.error("notificationService.subscribe error:", err),
    );
  },

  async markRead(notifId: string): Promise<void> {
    if (isPrototypeDemoMode()) return;
    await updateDoc(doc(db, "notifications", notifId), {
      read: true,
      readAt: serverTimestamp(),
    });
  },

  /**
   * Request browser notification permission. Idempotent; returns the
   * current permission state.
   */
  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (typeof Notification === "undefined") return "denied";
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      try {
        localStorage.setItem(PERMISSION_KEY, result);
      } catch {
        /* swallow */
      }
      return result;
    }
    return Notification.permission;
  },

  /**
   * Show a browser notification, if permitted.
   */
  showBrowserNotification(title: string, body?: string, onClick?: () => void) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      const n = new Notification(title, {
        body,
        icon: "/icons/kesher-192.png",
        badge: "/icons/kesher-badge.png",
        lang: "he",
        dir: "rtl",
      });
      if (onClick) {
        n.onclick = () => {
          window.focus();
          onClick();
          n.close();
        };
      }
    } catch (e) {
      console.warn("Browser notification failed:", e);
    }
  },

  unreadCount(notifications: AppNotification[]): number {
    return notifications.filter((n) => !n.read).length;
  },
};
