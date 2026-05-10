import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Heart, MessageCircle, Shield, X } from "lucide-react";
import {
  notificationService,
  type AppNotification,
} from "@/services/notificationService";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<AppNotification["kind"], React.ReactNode> = {
  new_match: <Heart size={14} className="text-rose-500" />,
  new_message: <MessageCircle size={14} className="text-[#D4AF37]" />,
  consent_request: <Shield size={14} className="text-[#D4AF37]" />,
  consent_granted: <Check size={14} className="text-green-600" />,
  safety_action: <Shield size={14} className="text-amber-600" />,
  system: <Bell size={14} className="text-[#8C7E6E]" />,
};

interface Props {
  uid: string | null;
  onNotificationClick?: (n: AppNotification) => void;
}

/**
 * Notification bell with live Firestore subscription.
 * Unread count badge; dropdown of recent notifications.
 */
export const NotificationBell: React.FC<Props> = ({ uid, onNotificationClick }) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    const unsub = notificationService.subscribeToNotifications(uid, (next) => {
      setItems(next);
    });
    return () => unsub();
  }, [uid]);

  const unread = notificationService.unreadCount(items);

  const handleClick = (n: AppNotification) => {
    notificationService.markRead(n.id).catch(() => {});
    setOpen(false);
    onNotificationClick?.(n);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`התראות (${unread} חדשות)`}
        className="relative w-10 h-10 rounded-full hover:bg-[#F7F2EE] flex items-center justify-center transition-colors"
      >
        <Bell size={18} className="text-[#2D2926]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-label="התראות"
              className="absolute z-50 top-12 -right-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E8E0D8] rounded-3xl shadow-2xl shadow-black/15 overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3EFEA]">
                <h3 className="text-sm font-bold">התראות</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[#C4B5A5] hover:text-[#2D2926] p-1"
                  aria-label="סגור"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="px-5 py-8 text-center text-xs text-[#8C7E6E]">
                    אין התראות חדשות
                  </div>
                ) : (
                  <ul>
                    {items.map((n) => (
                      <li key={n.id}>
                        <button
                          onClick={() => handleClick(n)}
                          className={cn(
                            "w-full text-right px-5 py-3 hover:bg-[#FBF8F5] flex items-start gap-3 transition-colors",
                            !n.read && "bg-[#FFF7E5]/40",
                          )}
                        >
                          <div className="w-7 h-7 rounded-full bg-[#F7F2EE] flex items-center justify-center shrink-0 mt-0.5">
                            {KIND_ICONS[n.kind]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{n.title}</p>
                            {n.body && <p className="text-xs text-[#6B5E52] mt-0.5 line-clamp-2">{n.body}</p>}
                            <p className="text-[10px] text-[#C4B5A5] mt-1">
                              {new Date(n.createdAt).toLocaleString("he-IL", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
