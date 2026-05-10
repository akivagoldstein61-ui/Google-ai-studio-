/**
 * Real-time chat service.
 *
 * Messages are stored as a subcollection under each conversation:
 *   /conversations/{conversationId}/messages/{messageId}
 *
 * The UI subscribes via `subscribeToMessages` which returns an unsubscribe
 * function. Sending uses an addDoc on the subcollection — Firestore rules
 * (in firestore.rules) enforce that only conversation participants can write.
 *
 * Demo mode short-circuits to a local-only message list maintained in the
 * AppContext, so reviewers can walk the flow without writes.
 */

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase";
import { isPrototypeDemoMode } from "@/lib/prototypeMode";
import type { Message } from "@/types";

export interface SendOptions {
  aiAssisted?: boolean;
}

export const chatService = {
  /**
   * Subscribe to the most recent N messages of a conversation. Returns an
   * unsubscribe function; the callback fires whenever messages change.
   * In demo mode, this is a no-op (returns a noop unsubscribe).
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    maxMessages = 200,
  ): Unsubscribe {
    if (isPrototypeDemoMode()) {
      // Demo: caller manages messages directly in component state
      return () => {};
    }
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc"),
      limit(maxMessages),
    );
    return onSnapshot(
      q,
      (snap) => {
        const messages: Message[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            senderId: data.senderId,
            text: data.text,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString?.() ??
              data.createdAt ??
              new Date().toISOString(),
            aiAssisted: !!data.aiAssisted,
          };
        });
        callback(messages);
      },
      (err) => {
        console.error("chatService.subscribeToMessages error:", err);
      },
    );
  },

  /**
   * Send a new message. Returns the new message's id.
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    options: SendOptions = {},
  ): Promise<string> {
    if (isPrototypeDemoMode()) {
      // Demo: synthesize an id; AppContext will own state
      return `msg_demo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const ref = await addDoc(messagesRef, {
      senderId,
      text,
      aiAssisted: !!options.aiAssisted,
      createdAt: serverTimestamp(),
    });

    // Bump the conversation last-activity timestamp (powers inbox sort)
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        lastActivityAt: serverTimestamp(),
        lastMessagePreview: text.slice(0, 120),
        lastMessageSenderId: senderId,
      });
    } catch (e) {
      // Non-fatal — message itself was saved
      console.warn("Failed to bump conversation activity:", e);
    }

    return ref.id;
  },

  /**
   * Mark a conversation as read by the given user.
   */
  async markAsRead(conversationId: string, uid: string): Promise<void> {
    if (isPrototypeDemoMode()) return;
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        [`readAt.${uid}`]: serverTimestamp(),
      });
    } catch (e) {
      console.warn("markAsRead failed:", e);
    }
  },

  /**
   * Typing indicator — best-effort heartbeat. Caller should debounce.
   */
  async setTyping(conversationId: string, uid: string, isTyping: boolean): Promise<void> {
    if (isPrototypeDemoMode()) return;
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        [`typing.${uid}`]: isTyping ? serverTimestamp() : null,
      });
    } catch {
      // ignore
    }
  },
};
