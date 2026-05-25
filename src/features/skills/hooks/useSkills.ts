import React from 'react';
import {
  getFeaturedSkills,
  getRecommendedSkillsForSurface,
  getSkillById,
  getSkillsForSurface,
  SKILLS,
} from '../skillRegistry';
import type { SkillSurface } from '../types';
import { useSkillState } from './useSkillState';

export const useSkills = (surface?: SkillSurface, options?: { includeInternal?: boolean; limit?: number }) => {
  const skillState = useSkillState();

  const availableSkills = React.useMemo(() => (
    surface
      ? getSkillsForSurface(surface, { includeInternal: options?.includeInternal })
      : SKILLS.filter((skill) => options?.includeInternal || skill.safetyLevel !== 'internal')
  ), [options?.includeInternal, surface]);

  const recommendations = React.useMemo(() => (
    surface
      ? getRecommendedSkillsForSurface(surface, { includeInternal: options?.includeInternal, limit: options?.limit })
      : getFeaturedSkills().slice(0, options?.limit ?? 4)
  ), [options?.includeInternal, options?.limit, surface]);

  const startedSkills = React.useMemo(() => (
    availableSkills.filter((skill) => skillState.getSkillState(skill.id).status === 'started')
  ), [availableSkills, skillState]);

  return {
    allSkills: SKILLS,
    availableSkills,
    recommendations,
    startedSkills,
    getSkillById,
    ...skillState,
  };
};
