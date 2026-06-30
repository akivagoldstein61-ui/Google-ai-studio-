import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Star, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  getEntitlement,
  startTrial,
  cancelSubscription,
  getPremiumFeatureLabels,
  type Entitlement,
} from '../../services/entitlementService';

interface SubscriptionScreenProps {
  onBack: () => void;
}

const FREE_FEATURES = [
  '5 Daily Picks',
  'Basic Share Cards',
  'Why This Match explanations',
  'Bio Coach',
  'Message Openers',
  'Pacing Coach',
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack }) => {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const premiumLabels = getPremiumFeatureLabels();

  useEffect(() => {
    getEntitlement().then(e => {
      setEntitlement(e);
      setLoading(false);
    });
  }, []);

  const handleStartTrial = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await startTrial();
      setEntitlement(updated);
      setSuccess('Your 7-day free trial has started. Enjoy premium access!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start trial. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.')) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await cancelSubscription();
      setEntitlement(updated);
      setSuccess('Your subscription has been cancelled. Access continues until the period ends.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const isPremiumActive = entitlement && entitlement.tier === 'premium' &&
    (entitlement.status === 'active' || entitlement.status === 'trial');

  const statusLabel = () => {
    if (!entitlement) return '';
    if (entitlement.tier === 'free') return 'Free';
    if (entitlement.status === 'trial') return 'Premium Trial';
    if (entitlement.status === 'active') return 'Premium';
    if (entitlement.status === 'cancelled') return 'Premium (cancelling)';
    if (entitlement.status === 'expired') return 'Expired';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-14 pb-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={22} className="text-[#2D2926]" />
        </button>
        <h1 className="text-2xl font-serif italic text-[#2D2926]">Membership</h1>
      </div>

      <div className="flex-1 px-6 pb-10 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
          </div>
        ) : (
          <>
            {/* Current status */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F7F2EE] rounded-3xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Current plan</p>
                <p className="text-xl font-serif italic text-[#2D2926] mt-1">{statusLabel()}</p>
                {entitlement?.expiresAt && (
                  <p className="text-xs text-[#8C7E6E] mt-1">
                    {entitlement.status === 'cancelled' ? 'Access until' : 'Renews'}{' '}
                    {new Date(entitlement.expiresAt).toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
              {isPremiumActive && (
                <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Star size={18} className="text-white fill-white" />
                </div>
              )}
            </motion.div>

            {/* Feedback messages */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-2xl p-4">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Free tier features */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Free includes</h2>
              <div className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#F7F2EE] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-[#2D2926]" />
                    </div>
                    <span className="text-sm text-[#2D2926]">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium features */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">Premium adds</h2>
              <div className="space-y-2">
                {Object.values(premiumLabels).map(label => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-white" />
                    </div>
                    <span className="text-sm text-[#2D2926]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-[#8C7E6E] leading-relaxed">
              Premium membership never unlocks access to other members' private data, personality profiles, or safety controls. Privacy and consent features are always free.
            </p>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {!isPremiumActive && !entitlement?.trialUsed && (
                <Button
                  className="w-full h-14 bg-[#D4AF37] hover:bg-[#C49B2A] text-white font-bold rounded-full"
                  onClick={handleStartTrial}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Start 7-day free trial'}
                </Button>
              )}
              {!isPremiumActive && entitlement?.trialUsed && (
                <Button
                  className="w-full h-14 bg-[#2D2926] text-white font-bold rounded-full"
                  onClick={() => {
                    // Production: open Stripe checkout. For now, show a message.
                    setSuccess('Subscription checkout coming soon. Contact support to upgrade.');
                  }}
                  disabled={actionLoading}
                >
                  Upgrade to Premium
                </Button>
              )}
              {isPremiumActive && entitlement?.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  className="w-full h-12 text-[#8C7E6E] border-[#E8E0D8] rounded-full text-sm"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Cancel subscription'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
