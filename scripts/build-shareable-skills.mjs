#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const SKILLS_DIR = 'skills';
const HTML_OUT = 'public/prototype/skills.html';
const ZIP_OUT = 'public/downloads/kesher-personality-skills.zip';
const FULL_MD_OUT = 'kesher-skills-full.md';
const AI_STUDIO_MD_OUT = 'docs/ai-studio/skills-reference.md';

const htmlEscape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const parseFrontmatter = (content, fallbackName) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { name: fallbackName, description: '', body: content };
  }

  const frontmatter = match[1];
  const name = frontmatter.match(/^name:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim() || fallbackName;
  const description = frontmatter.match(/^description:\s*"?([\s\S]*?)"?\s*$/m)?.[1]?.trim() || '';
  return { name, description, body: match[2] };
};

const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((dir) => existsSync(join(SKILLS_DIR, dir, 'SKILL.md')))
  .sort((a, b) => a.localeCompare(b));

const skills = skillDirs.map((dir) => {
  const path = join(SKILLS_DIR, dir, 'SKILL.md');
  const content = readFileSync(path, 'utf8');
  return {
    dir,
    path,
    content,
    ...parseFrontmatter(content, dir),
  };
});

if (skills.length !== 35) {
  throw new Error(`Expected 35 shareable skills, found ${skills.length}`);
}

mkdirSync('public/prototype', { recursive: true });
mkdirSync('public/downloads', { recursive: true });
mkdirSync('docs/ai-studio', { recursive: true });

const generatedAt = new Date().toISOString();

const htmlCards = skills.map((skill) => `
          <article class="skill">
            <p class="eyebrow">${htmlEscape(skill.dir)}</p>
            <h2>${htmlEscape(skill.name)}</h2>
            <p>${htmlEscape(skill.description)}</p>
            <a href="https://github.com/akivagoldstein61-ui/Google-ai-studio-/tree/main/${htmlEscape(skill.path.replace('/SKILL.md', ''))}">Open source folder</a>
          </article>`).join('\n');

writeFileSync(HTML_OUT, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kesher Personality Skills Prototype</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #2d2926;
        --muted: #6b5e52;
        --line: #e5e0db;
        --paper: #fdfcfb;
        --panel: #ffffff;
        --accent: #c8956b;
        --accent-2: #d4af37;
        --soft: #f7f2ee;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--paper);
        color: var(--ink);
      }
      main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0; }
      header {
        background: #2d2926;
        color: white;
        border-radius: 24px;
        padding: 32px;
        margin-bottom: 24px;
      }
      h1 { margin: 0 0 12px; font-family: Georgia, serif; font-style: italic; font-size: clamp(2rem, 5vw, 4rem); }
      h2 { margin: 8px 0; font-size: 1rem; }
      p { line-height: 1.6; color: inherit; }
      .summary { color: rgba(255,255,255,.72); max-width: 760px; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
      .button {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 12px 18px;
        background: var(--accent-2);
        color: #2d2926;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        text-decoration: none;
      }
      .button.secondary { background: rgba(255,255,255,.1); color: white; border: 1px solid rgba(255,255,255,.18); }
      .meta { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 24px; color: var(--muted); font-size: 12px; }
      .pill { border: 1px solid var(--line); border-radius: 999px; padding: 8px 12px; background: white; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .skill { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
      .skill p { color: var(--muted); font-size: 14px; }
      .skill a { color: var(--accent); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
      .eyebrow { margin: 0; color: var(--accent) !important; font-size: 10px !important; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
      footer { margin-top: 32px; color: var(--muted); font-size: 12px; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">Shareable skills bundle</p>
        <h1>Kesher Personality Skills</h1>
        <p class="summary">
          ${skills.length} implementable skills for the Kesher personality prototype. The public prototype uses
          reflection, tendencies, possible strengths/friction, and release gates. It does not ship public rankings,
          public exact values, predictions, or production personality activation.
        </p>
        <div class="actions">
          <a class="button" href="/skills-hub">Open Skills Hub</a>
          <a class="button secondary" href="/prototype/personality">Open IPIP-BFAS Journey</a>
          <a class="button secondary" href="/downloads/kesher-personality-skills.zip" download>Download Skills Zip</a>
        </div>
      </header>
      <div class="meta">
        <span class="pill">Skill count: ${skills.length}</span>
        <span class="pill">Generated: ${generatedAt}</span>
        <span class="pill">Source: repo skills/ folder</span>
      </div>
      <section class="grid">
${htmlCards}
      </section>
      <footer>
        English IPIP-BFAS scoring is prototype-only. Hebrew validation, privacy review, and release gates remain required before production activation.
      </footer>
    </main>
  </body>
</html>
`);

writeFileSync(FULL_MD_OUT, `# Kesher Personality Skills Bundle

Generated: ${generatedAt}

This shareable bundle contains ${skills.length} implementable skills from the canonical \`skills/\` folder.

${skills.map((skill) => `---

# ${skill.name}

Source: \`${skill.path}\`

${skill.content.trim()}
`).join('\n')}
`);

writeFileSync(AI_STUDIO_MD_OUT, `# Kesher Skills Reference

This document is a concise reference for all ${skills.length} Kesher skills. It can be pasted as a context document in Google AI Studio, used in the Vercel prototype review, or shared with implementation agents.

${skills.map((skill, index) => `## Skill ${index + 1} — ${skill.name}

**Source:** \`${skill.path}\`

${skill.description}
`).join('\n')}

## Global Safety Contract

- Use reflection, tendencies, possible strengths/friction, and uncertainty-aware copy.
- Do not use public rankings, public exact values, hidden fit meters, certainty claims, or production activation from the prototype.
- Keep English IPIP-BFAS scoring prototype-only; Hebrew validation remains pending.
`);

rmSync(ZIP_OUT, { force: true });
execFileSync('zip', ['-qr', ZIP_OUT, SKILLS_DIR, '-x', '*.DS_Store'], { stdio: 'inherit' });

console.log(`Built ${skills.length} shareable skills`);
console.log(`- ${HTML_OUT}`);
console.log(`- ${ZIP_OUT}`);
console.log(`- ${FULL_MD_OUT}`);
console.log(`- ${AI_STUDIO_MD_OUT}`);
