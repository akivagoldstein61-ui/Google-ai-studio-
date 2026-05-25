import React from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useApp } from '@/context/AppContext';
import type {
  SavedSkillOutputRef,
  SkillConsentSnapshot,
  SkillStateStatus,
  SkillSurface,
  SkillTransitionOptions,
  UserSkillState,
} from './types';
import { emitSkillEvent } from './skillEvents';

export type SkillStateMap = Record<string, UserSkillState>;

type SkillAction = 'start' | 'complete' | 'apply' | 'dismiss' | 'gate' | 'reset';

const LOCAL_STORAGE_PREFIX = 'kesher.skillState.v1';
const CONSENT_VERSION = 'skills-v1';

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

export const getSkillStateStorageKey = (userId: string) => `${LOCAL_STORAGE_PREFIX}.${userId}`;

export const sanitizeOutputRef = (outputRef: SavedSkillOutputRef): SavedSkillOutputRef => ({
  id: outputRef.id,
  type: outputRef.type,
  summary: outputRef.summary?.slice(0, 180),
  createdAt: outputRef.createdAt,
  sourceSurface: outputRef.sourceSurface,
});

export const createSkillConsentSnapshot = (
  accepted: SkillConsentSnapshot['accepted'],
  declined: SkillConsentSnapshot['declined'] = [],
  now = new Date().toISOString(),
): SkillConsentSnapshot => ({
  accepted,
  declined,
  acceptedAt: accepted.length ? now : undefined,
  version: CONSENT_VERSION,
});

export const createDefaultSkillState = (
  userId: string,
  skillId: string,
  now = new Date().toISOString(),
  status: SkillStateStatus = 'available',
): UserSkillState => ({
  userId,
  skillId,
  status,
  progress: status === 'gated' ? 0 : 0,
  savedOutputRefs: [],
  updatedAt: now,
});

export const transitionSkillState = (
  current: UserSkillState,
  action: SkillAction,
  options: SkillTransitionOptions = {},
): UserSkillState => {
  const now = options.now ?? new Date().toISOString();
  const next: UserSkillState = {
    ...current,
    lastUsedAt: action === 'reset' ? current.lastUsedAt : now,
    surfaceUsedFrom: options.surface ?? current.surfaceUsedFrom,
    consentSnapshot: options.consentSnapshot ?? current.consentSnapshot,
    updatedAt: now,
  };

  if (options.outputRef) {
    next.savedOutputRefs = [...current.savedOutputRefs, sanitizeOutputRef(options.outputRef)];
  }

  switch (action) {
    case 'start':
      return {
        ...next,
        status: current.status === 'completed' || current.status === 'applied' ? current.status : 'started',
        progress: Math.max(current.progress, 0.25),
      };
    case 'complete':
      return {
        ...next,
        status: 'completed',
        progress: 1,
        completedAt: now,
      };
    case 'apply':
      return {
        ...next,
        status: 'applied',
        progress: 1,
        completedAt: current.completedAt ?? now,
      };
    case 'dismiss':
      return {
        ...next,
        status: 'dismissed',
        progress: clampProgress(current.progress),
      };
    case 'gate':
      return {
        ...next,
        status: 'gated',
        progress: 0,
      };
    case 'reset':
      return createDefaultSkillState(current.userId, current.skillId, now);
    default:
      return next;
  }
};

const safeReadLocal = (key: string): SkillStateMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as SkillStateMap : {};
  } catch {
    return {};
  }
};

const safeWriteLocal = (key: string, states: SkillStateMap) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(states));
  } catch {
    // Demo persistence is best-effort; failures should never block the flow.
  }
};

export const useSkillState = () => {
  const { user, isDemoMode, isLocalMockAuth, trackEvent } = useApp();
  const userId = user?.id ?? 'demo-user';
  const [states, setStates] = React.useState<SkillStateMap>({});
  const statesRef = React.useRef<SkillStateMap>({});
  const storageKey = React.useMemo(() => getSkillStateStorageKey(userId), [userId]);
  const shouldUseFirestore = Boolean(!isDemoMode && !isLocalMockAuth && auth.currentUser?.uid);

  React.useEffect(() => {
    let cancelled = false;
    const replaceStates = (nextStates: SkillStateMap) => {
      statesRef.current = nextStates;
      setStates(nextStates);
    };

    const load = async () => {
      const localStates = safeReadLocal(storageKey);
      if (!cancelled) replaceStates(localStates);

      if (!shouldUseFirestore || !auth.currentUser?.uid) return;
      try {
        const ref = doc(db, 'users', auth.currentUser.uid, 'private', 'skill_state');
        const snap = await getDoc(ref);
        if (!cancelled && snap.exists()) {
          const remoteStates = (snap.data().states ?? {}) as SkillStateMap;
          replaceStates(remoteStates);
          safeWriteLocal(storageKey, remoteStates);
        }
      } catch {
        // Keep the demo-safe local fallback active when remote state is unavailable.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [shouldUseFirestore, storageKey]);

  const persist = React.useCallback(async (nextStates: SkillStateMap) => {
    safeWriteLocal(storageKey, nextStates);
    if (!shouldUseFirestore || !auth.currentUser?.uid) return;
    try {
      const ref = doc(db, 'users', auth.currentUser.uid, 'private', 'skill_state');
      await setDoc(ref, { states: nextStates, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {
      // Local state remains the source of truth for prototype/demo fallback.
    }
  }, [shouldUseFirestore, storageKey]);

  const getSkillState = React.useCallback((skillId: string) => (
    states[skillId] ?? createDefaultSkillState(userId, skillId)
  ), [states, userId]);

  const updateSkill = React.useCallback((skillId: string, action: SkillAction, options?: SkillTransitionOptions) => {
    const currentStates = statesRef.current;
    const current = currentStates[skillId] ?? createDefaultSkillState(userId, skillId, options?.now);
    const next = transitionSkillState(current, action, options);
    const nextStates = { ...currentStates, [skillId]: next };

    statesRef.current = nextStates;
    setStates(nextStates);
    void persist(nextStates);

    const eventByAction: Partial<Record<SkillAction, Parameters<typeof emitSkillEvent>[1]>> = {
      start: 'skill_started',
      complete: 'skill_completed',
      apply: 'skill_applied',
      dismiss: 'skill_dismissed',
      gate: 'skill_viewed',
    };
    const eventName = eventByAction[action];
    if (eventName) {
      emitSkillEvent(trackEvent, eventName, {
        skillId,
        status: next.status,
        surface: options?.surface,
        outputType: options?.outputRef?.type,
      });
    }
    return next;
  }, [persist, trackEvent, userId]);

  const startSkill = React.useCallback((skillId: string, surface?: SkillSurface, consentSnapshot?: SkillConsentSnapshot) => (
    updateSkill(skillId, 'start', { surface, consentSnapshot })
  ), [updateSkill]);

  const completeSkill = React.useCallback((skillId: string, outputRef?: SavedSkillOutputRef, surface?: SkillSurface) => (
    updateSkill(skillId, 'complete', { outputRef, surface })
  ), [updateSkill]);

  const applySkill = React.useCallback((skillId: string, outputRef?: SavedSkillOutputRef, surface?: SkillSurface) => (
    updateSkill(skillId, 'apply', { outputRef, surface })
  ), [updateSkill]);

  const dismissSkill = React.useCallback((skillId: string, surface?: SkillSurface) => (
    updateSkill(skillId, 'dismiss', { surface })
  ), [updateSkill]);

  const gateSkill = React.useCallback((skillId: string, surface?: SkillSurface) => (
    updateSkill(skillId, 'gate', { surface })
  ), [updateSkill]);

  return {
    userId,
    states,
    getSkillState,
    startSkill,
    completeSkill,
    applySkill,
    dismissSkill,
    gateSkill,
    updateSkill,
    isRemoteBacked: shouldUseFirestore,
  };
};
