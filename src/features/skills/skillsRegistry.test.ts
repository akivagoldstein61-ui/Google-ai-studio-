import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SKILLS } from './SkillsHub';

describe('Kesher skills registry prototype visibility', () => {
  it('keeps all 35 Kesher skills visible as prototype experiences', () => {
    expect(SKILLS).toHaveLength(35);
    expect(SKILLS.every((skill) => skill.status === 'prototype')).toBe(true);
  });

  it('gives every visible skill enough metadata to render a details page', () => {
    for (const skill of SKILLS) {
      expect(skill.id).toBeTruthy();
      expect(skill.title).toBeTruthy();
      expect(skill.subtitle).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.keyFeatures?.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps the shareable skills folder in parity with the prototype count', () => {
    const skillDirs = readdirSync('skills', { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join('skills', entry.name, 'SKILL.md')));

    expect(skillDirs).toHaveLength(35);
  });
});
