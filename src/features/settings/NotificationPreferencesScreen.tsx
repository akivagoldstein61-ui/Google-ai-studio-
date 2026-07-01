import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bell, BellOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NOTIFICATION_LABELS,
  NOTIFICATION_DESCRIPTIONS,
  type NotificationPreferences,
} from '../../services/notificationService';

interface NotificationPreferencesScreenProps {
  onBack: () => void;
}

type ToggleKey = keyof Pick<NotificationPreferences,
  'p1_match_new' | 'p1_message_new' | 'p1_consent_change' |
  'p2_date_reminder' | 'p3_engagement_nudge'
>;

const TOGGLE_KEYS: ToggleKey[] = [
  'p1_match_new',
  'p1_message_new',
  'p1_consent_change',
  'p2_date_reminder',
  'p3_engagement_nudge',
];

export const NotificationPreferencesScreen: React.FC<NotificationPreferencesScreenProps> = ({ onBack }) => {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then(p => {
      setPrefs(p);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (key: ToggleKey) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    setSaved(false);
    try {
      await updateNotificationPreferences({ [key]: updated[key] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Revert on failure
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-14 pb-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={22} className="text-[#2D2926]" />
        </button>
        <h1 className="text-2xl font-serif italic text-[#2D2926]">Notifications</h1>
        {saving && <Loader2 size={16} className="animate-spin text-[#8C7E6E] ml-auto" />}
        {saved && !saving && <span className="text-xs text-green-600 ml-auto font-medium">Saved</span>}
      </div>

      <div className="flex-1 px-6 pb-10 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
          </div>
        ) : (
          <>
            {/* Always-on P0 notice */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-[#F7F2EE] rounded-2xl p-4"
            >
              <ShieldCheck size={18} className="text-[#2D2926] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#2D2926]">Safety & account alerts are always on</p>
                <p className="text-xs text-[#8C7E6E] mt-1 leading-relaxed">
                  Notifications about your account security, safety events, and legal rights cannot be disabled.
                </p>
              </div>
            </motion.div>

            {/* Toggleable preferences */}
            <div className="space-y-3">
              {TOGGLE_KEYS.map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start justify-between gap-4 bg-white border border-[#E8E0D8] rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${prefs?.[key] ? 'bg-[#2D2926]' : 'bg-[#F7F2EE]'}`}>
                      {prefs?.[key]
                        ? <Bell size={14} className="text-white" />
                        : <BellOff size={14} className="text-[#8C7E6E]" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#2D2926]">{NOTIFICATION_LABELS[key]}</p>
                      <p className="text-xs text-[#8C7E6E] mt-0.5 leading-relaxed">{NOTIFICATION_DESCRIPTIONS[key]}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] ${prefs?.[key] ? 'bg-[#2D2926]' : 'bg-[#E8E0D8]'}`}
                    aria-label={`${prefs?.[key] ? 'Disable' : 'Enable'} ${NOTIFICATION_LABELS[key]}`}
                    aria-checked={prefs?.[key]}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${prefs?.[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-[#8C7E6E] leading-relaxed">
              Changes take effect immediately. You can update these preferences at any time.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
