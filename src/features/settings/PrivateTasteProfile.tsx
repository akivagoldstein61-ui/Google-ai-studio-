import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, RefreshCw, Info, Edit2, Check, X, Loader2, Shield, Pause, Download, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import type { TasteProfileDraft } from '@/types';

type TasteListKey = 'soft_preferences' | 'things_to_avoid' | 'hard_dealbreakers';
type ProfileAction = 'save' | 'refresh' | 'pause' | 'optOut' | 'reset' | 'delete' | 'export';

function emptyPrivateTasteProfile(paused = true): TasteProfileDraft {
  return {
    hard_dealbreakers: [],
    soft_preferences: [],
    things_to_avoid: [],
    weights: {
      values_weight: 0.5,
      stability_weight: 0.5,
      pacing_weight: 0.5,
    },
    learning: {
      paused,
      optedOut: false,
      lastUpdatedAt: null,
    },
    provenance: {},
    lockedItems: [],
    removedItems: [],
    explanation: '',
  };
}

function normalizeTasteProfileDraft(raw: any): TasteProfileDraft {
  const input = raw && typeof raw === 'object' ? raw : {};
  const weights = input.weights && typeof input.weights === 'object' ? input.weights : {};
  return {
    ...emptyPrivateTasteProfile(),
    ...input,
    hard_dealbreakers: Array.isArray(input.hard_dealbreakers) ? input.hard_dealbreakers : [],
    soft_preferences: Array.isArray(input.soft_preferences) ? input.soft_preferences : [],
    things_to_avoid: Array.isArray(input.things_to_avoid) ? input.things_to_avoid : [],
    weights: {
      values_weight: typeof weights.values_weight === 'number'
        ? weights.values_weight
        : typeof weights.values_vs_lifestyle === 'number'
          ? weights.values_vs_lifestyle
          : 0.5,
      stability_weight: typeof weights.stability_weight === 'number' ? weights.stability_weight : 0.5,
      pacing_weight: typeof weights.pacing_weight === 'number' ? weights.pacing_weight : 0.5,
    },
    learning: {
      paused: typeof input.learning?.paused === 'boolean' ? input.learning.paused : true,
      optedOut: input.learning?.optedOut === true,
      lastUpdatedAt: typeof input.learning?.lastUpdatedAt === 'string' ? input.learning.lastUpdatedAt : null,
    },
    provenance: input.provenance && typeof input.provenance === 'object' ? input.provenance : {},
    lockedItems: Array.isArray(input.lockedItems) ? input.lockedItems : [],
    removedItems: Array.isArray(input.removedItems) ? input.removedItems : [],
    explanation: typeof input.explanation === 'string' ? input.explanation : '',
  };
}

function mergeManualControls(raw: any, current: TasteProfileDraft): TasteProfileDraft {
  const next = normalizeTasteProfileDraft(raw);
  const merged: TasteProfileDraft = {
    ...next,
    learning: current.learning,
    provenance: { ...next.provenance, ...current.provenance },
    lockedItems: [...(current.lockedItems ?? [])],
    removedItems: [...(current.removedItems ?? [])],
  };

  for (const lockKey of current.lockedItems ?? []) {
    const [key, ...valueParts] = lockKey.split(':') as [TasteListKey, ...string[]];
    const value = valueParts.join(':');
    if (key in merged && Array.isArray(merged[key]) && value) {
      merged[key] = Array.from(new Set([...(merged[key] as string[]), value])) as any;
    }
  }

  for (const removedKey of current.removedItems ?? []) {
    const [key, ...valueParts] = removedKey.split(':') as [TasteListKey, ...string[]];
    const value = valueParts.join(':');
    if (key in merged && Array.isArray(merged[key]) && value) {
      merged[key] = (merged[key] as string[]).filter((item) => item !== value) as any;
    }
  }

  return merged;
}

const TasteListEditor: React.FC<{
  title: string;
  listKey: TasteListKey;
  displayProfile: TasteProfileDraft;
  editedProfile: TasteProfileDraft;
  isEditing: boolean;
  onChange: (profile: TasteProfileDraft) => void;
}> = ({ title, listKey, displayProfile, editedProfile, isEditing, onChange }) => {
  const [addingNew, setAddingNew] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const items = isEditing ? editedProfile[listKey] : displayProfile[listKey];
  const lockedItems = editedProfile.lockedItems ?? [];

  const toggleLock = (item: string) => {
    const lockKey = `${listKey}:${item}`;
    onChange({
      ...editedProfile,
      lockedItems: lockedItems.includes(lockKey)
        ? lockedItems.filter((locked) => locked !== lockKey)
        : [...lockedItems, lockKey],
    });
  };

  const removeItem = (item: string) => {
    const currentItems = editedProfile[listKey];
    const removedKey = `${listKey}:${item}`;
    onChange({
      ...editedProfile,
      [listKey]: currentItems.filter((current) => current !== item),
      removedItems: Array.from(new Set([...(editedProfile.removedItems ?? []), removedKey])),
    });
  };

  const addItem = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const removedKey = `${listKey}:${trimmed}`;
    onChange({
      ...editedProfile,
      [listKey]: Array.from(new Set([...editedProfile[listKey], trimmed])),
      removedItems: (editedProfile.removedItems ?? []).filter((item) => item !== removedKey),
    });
  };

  const commitNewItem = () => {
    addItem(newItemText);
    setNewItemText('');
    setAddingNew(false);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">{title}</h4>
      <div className="flex flex-wrap gap-2 items-center">
        {items.map((item: string) => {
          const lockKey = `${listKey}:${item}`;
          const locked = lockedItems.includes(lockKey);
          return (
            <div key={lockKey} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#F3EFEA] rounded-full text-xs font-medium text-[#2D2926]">
              <span>{item}</span>
              {isEditing && (
                <>
                  <button
                    onClick={() => toggleLock(item)}
                    className="text-[#8C7E6E] hover:text-[#2D2926]"
                    title={locked ? 'Unlock' : 'Lock'}
                    aria-label={locked ? `Unlock ${item}` : `Lock ${item}`}
                  >
                    {locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                  {!locked && (
                    <button
                      onClick={() => removeItem(item)}
                      className="text-[#8C7E6E] hover:text-red-500"
                      aria-label={`Remove ${item}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
        {isEditing && !addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            className="px-3 py-1.5 bg-[#F7F2EE] border border-dashed border-[#D4AF37]/50 rounded-full text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            + Add
          </button>
        )}
        {isEditing && addingNew && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitNewItem();
                } else if (e.key === 'Escape') {
                  setNewItemText('');
                  setAddingNew(false);
                }
              }}
              onBlur={commitNewItem}
              className="px-3 py-1 bg-white border border-[#D4AF37] rounded-full text-xs font-medium text-[#2D2926] focus:outline-none w-32"
              placeholder="Type and enter..."
            />
          </div>
        )}
        {!isEditing && items.length === 0 && (
          <span className="text-xs text-[#8C7E6E] italic">None learned yet.</span>
        )}
      </div>
    </div>
  );
};

export const PrivateTasteProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    tasteProfile,
    setTasteProfile,
    resetTasteProfile,
    pauseTasteLearning,
    optOutTasteLearning,
    exportTasteProfile,
    deleteTasteProfile,
    interactions,
    trackEvent,
    user,
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<TasteProfileDraft>(() => normalizeTasteProfileDraft(tasteProfile));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<ProfileAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      trackEvent('private_taste_profile_viewed', { userId: user.id });
    }
  }, [user, trackEvent]);

  useEffect(() => {
    setEditedProfile(normalizeTasteProfileDraft(tasteProfile));
  }, [tasteProfile]);

  const signalCount = interactions.likes.length + interactions.passes.length + interactions.moreLikeThis.length + interactions.lessLikeThis.length;
  const learningPaused = tasteProfile.learning.paused || tasteProfile.learning.optedOut;
  const isBusy = pendingAction !== null || isAnalyzing;

  const runProfileAction = async <T,>(action: ProfileAction, failureMessage: string, work: () => Promise<T>) => {
    setPendingAction(action);
    setActionError(null);
    try {
      return await work();
    } catch (error) {
      console.error(failureMessage, error);
      setActionError(failureMessage);
      return undefined;
    } finally {
      setPendingAction(null);
    }
  };

  const handleReset = async () => {
    await runProfileAction('reset', 'Could not reset private taste profile. Please try again.', async () => {
      await resetTasteProfile();
      setShowResetConfirm(false);
    });
  };

  const handleSave = async () => {
    await runProfileAction('save', 'Could not save private taste profile. Please try again.', async () => {
      await setTasteProfile(normalizeTasteProfileDraft(editedProfile));
      setIsEditing(false);
    });
  };

  const handleAnalyze = async () => {
    if (learningPaused) return;
    setIsAnalyzing(true);
    setActionError(null);
    try {
      const newProfile = await aiService.analyzeTasteProfile(interactions, tasteProfile);
      if (newProfile) {
        const mergedProfile = mergeManualControls(newProfile, {
          ...tasteProfile,
          learning: {
            ...tasteProfile.learning,
            lastUpdatedAt: new Date().toISOString(),
          },
        });
        await setTasteProfile(mergedProfile);
        setEditedProfile(mergedProfile);
      }
    } catch (error) {
      console.error('Taste profile analysis error:', error);
      setActionError('Could not refresh private taste profile. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async () => {
    const payload = await runProfileAction('export', 'Could not export private taste profile. Please try again.', exportTasteProfile);
    if (!payload || typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kesher-private-taste-profile-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePause = async () => {
    await runProfileAction('pause', 'Could not update taste learning. Please try again.', async () => {
      await pauseTasteLearning(!tasteProfile.learning.paused);
    });
  };

  const handleOptOut = async () => {
    await runProfileAction('optOut', 'Could not opt out of taste learning. Please try again.', optOutTasteLearning);
  };

  const handleDelete = async () => {
    await runProfileAction('delete', 'Could not delete private taste profile. Please try again.', deleteTasteProfile);
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#F3EFEA]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <ChevronLeft size={20} className="text-[#2D2926]" />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-serif italic text-[#2D2926]">Private Taste Profile</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Private recommendation tuning</p>
          </div>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} disabled={isBusy} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all text-[#D4AF37] disabled:opacity-50" aria-label="Edit private taste profile">
            <Edit2 size={18} />
          </button>
        ) : (
          <button onClick={handleSave} disabled={isBusy} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all text-emerald-600 disabled:opacity-50" aria-label="Save private taste profile">
            {pendingAction === 'save' ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-24">
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#D4AF37] relative z-10">
            <Shield size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Strictly Private</span>
          </div>
          <h3 className="text-lg font-serif italic leading-snug relative z-10">Your taste, your control.</h3>
          <p className="text-sm text-white/60 leading-relaxed italic relative z-10">
            This profile is tuned from your goals, filters, and recent activity. It is never shared with other users. Manual edits and locked items stay in your control.
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl -mr-16 -mt-16" />
        </section>

        {actionError && (
          <p role="alert" className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs font-medium text-red-700">
            {actionError}
          </p>
        )}

        <section className="space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-serif italic text-[#2D2926]">Learned Preferences</h3>
              <p className="text-[10px] text-[#8C7E6E] font-bold uppercase tracking-widest mt-1">
                {learningPaused ? 'Learning paused' : `${signalCount} eligible activity signals`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAnalyze}
              disabled={isBusy || isEditing || learningPaused || signalCount === 0}
              className="text-[#D4AF37] hover:text-[#B8962E] hover:bg-[#D4AF37]/5 rounded-full gap-2 font-bold uppercase tracking-[0.1em] text-[10px]"
            >
              {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {learningPaused ? 'Paused' : 'Refresh from Activity'}
            </Button>
          </div>

          {tasteProfile.explanation && !isEditing && (
            <div className="p-4 bg-[#F7F2EE] border border-[#F3EFEA] rounded-[24px] flex gap-3 items-start">
              <Info size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="text-xs text-[#8C7E6E] leading-relaxed italic">
                {tasteProfile.explanation}
              </p>
            </div>
          )}

          <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-6 shadow-sm">
            <TasteListEditor title="Soft Preferences" listKey="soft_preferences" displayProfile={tasteProfile} editedProfile={editedProfile} isEditing={isEditing} onChange={setEditedProfile} />
            <TasteListEditor title="Things to Avoid" listKey="things_to_avoid" displayProfile={tasteProfile} editedProfile={editedProfile} isEditing={isEditing} onChange={setEditedProfile} />
            <TasteListEditor title="Hard Dealbreakers" listKey="hard_dealbreakers" displayProfile={tasteProfile} editedProfile={editedProfile} isEditing={isEditing} onChange={setEditedProfile} />
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-serif italic text-[#2D2926]">Balancing Weights</h3>
          <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#2D2926]">
                <span>Values</span>
                <span>Stability</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.1"
                disabled={!isEditing || isBusy}
                value={isEditing ? editedProfile.weights.values_weight : tasteProfile.weights.values_weight}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  weights: { ...editedProfile.weights, values_weight: parseFloat(e.target.value) },
                })}
                className="w-full accent-[#D4AF37]"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#2D2926]">
                <span>Fast Paced</span>
                <span>Slow Paced</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.1"
                disabled={!isEditing || isBusy}
                value={isEditing ? editedProfile.weights.pacing_weight : tasteProfile.weights.pacing_weight}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  weights: { ...editedProfile.weights, pacing_weight: parseFloat(e.target.value) },
                })}
                className="w-full accent-[#D4AF37]"
              />
            </div>
          </div>
        </section>

        <section className="pt-4 space-y-3">
          <button
            onClick={handlePause}
            disabled={isBusy}
            className="w-full p-4 flex items-center justify-center gap-2 text-[#2D2926] hover:bg-[#F7F2EE] rounded-[24px] transition-all font-bold text-sm disabled:opacity-50"
          >
            {pendingAction === 'pause' ? <Loader2 size={16} className="animate-spin" /> : <Pause size={16} />}
            {tasteProfile.learning.paused ? 'Resume Taste Learning' : 'Pause Taste Learning'}
          </button>
          <button
            onClick={handleExport}
            disabled={isBusy}
            className="w-full p-4 flex items-center justify-center gap-2 text-[#2D2926] hover:bg-[#F7F2EE] rounded-[24px] transition-all font-bold text-sm disabled:opacity-50"
          >
            {pendingAction === 'export' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export Private Taste Profile
          </button>
          <button
            onClick={handleOptOut}
            disabled={isBusy}
            className="w-full p-4 flex items-center justify-center gap-2 text-[#8C7E6E] hover:bg-[#F7F2EE] rounded-[24px] transition-all font-bold text-sm disabled:opacity-50"
          >
            {pendingAction === 'optOut' ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            Opt Out of Taste Learning
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={isBusy}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-[24px] transition-all font-bold text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Reset Taste Learning
          </button>
          <button
            onClick={handleDelete}
            disabled={isBusy}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-[24px] transition-all font-bold text-sm disabled:opacity-50"
          >
            {pendingAction === 'delete' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Private Taste Profile
          </button>
        </section>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#FDFCFB] rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-[#F7F2EE] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2D2926]">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-xl font-serif italic text-[#2D2926]">Reset Taste Learning?</h3>
                <p className="text-sm text-[#8C7E6E] leading-relaxed">
                  Are you sure you want to reset your taste learning? This will clear your private preference model and keep learning paused until you enable it again.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full h-12 bg-[#2D2926] text-white font-bold rounded-full"
                  onClick={handleReset}
                  disabled={isBusy}
                >
                  {pendingAction === 'reset' ? 'Resetting...' : 'Yes, Reset'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-12 text-[#2D2926] font-bold rounded-full"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
