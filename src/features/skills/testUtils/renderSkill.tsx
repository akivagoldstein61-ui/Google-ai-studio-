import React from 'react';
import { render, type RenderResult } from '@testing-library/react';

export type SkillDir = 'rtl' | 'ltr';

/**
 * Reusable render harness for Skills Hub component render tests (PR A —
 * rendered-test foundation). Mounts a skill page inside a directional
 * container so we can assert it renders in both Hebrew-first RTL and LTR
 * without layout-time throws. This is the smallest building block the
 * deepening gate needs for criterion #8 (rendered route status) and #9
 * (mobile and RTL/LTR status); it intentionally does not assert pixel
 * layout, only that the component mounts and renders for each direction.
 */
export const renderInDir = (ui: React.ReactElement, dir: SkillDir): RenderResult =>
  render(<div dir={dir}>{ui}</div>);

/** Render the same component in both directions; returns both results. */
export const renderBothDirs = (ui: React.ReactElement): Record<SkillDir, RenderResult> => ({
  rtl: renderInDir(ui, 'rtl'),
  ltr: renderInDir(ui, 'ltr'),
});
