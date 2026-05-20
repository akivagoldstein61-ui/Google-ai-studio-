#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_DIR = 'skills';
const EXPECTED_SKILL_COUNT = 35;

const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((dir) => existsSync(join(SKILLS_DIR, dir, 'SKILL.md')))
  .sort((a, b) => a.localeCompare(b));

const failures = [];

if (skillDirs.length !== EXPECTED_SKILL_COUNT) {
  failures.push(`Expected ${EXPECTED_SKILL_COUNT} SKILL.md files, found ${skillDirs.length}`);
}

for (const dir of skillDirs) {
  const path = join(SKILLS_DIR, dir, 'SKILL.md');
  const content = readFileSync(path, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    failures.push(`${path} is missing YAML frontmatter`);
    continue;
  }
  const frontmatter = match[1];
  if (!/^name:\s*"?[^"\n]+"?\s*$/m.test(frontmatter)) {
    failures.push(`${path} is missing frontmatter name`);
  }
  if (!/^description:\s*"?[^"\n][\s\S]*"?\s*$/m.test(frontmatter)) {
    failures.push(`${path} is missing frontmatter description`);
  }
}

if (!existsSync('public/prototype/skills.html')) {
  failures.push('public/prototype/skills.html is missing');
} else {
  const html = readFileSync('public/prototype/skills.html', 'utf8');
  const staticCards = (html.match(/class="skill"/g) || []).length;
  if (staticCards !== EXPECTED_SKILL_COUNT) {
    failures.push(`public/prototype/skills.html has ${staticCards} skill cards`);
  }
}

if (!existsSync('public/downloads/kesher-personality-skills.zip')) {
  failures.push('public/downloads/kesher-personality-skills.zip is missing');
} else if (statSync('public/downloads/kesher-personality-skills.zip').size === 0) {
  failures.push('public/downloads/kesher-personality-skills.zip is empty');
}

if (failures.length > 0) {
  console.error('Skill validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`✅ test:skills: ${EXPECTED_SKILL_COUNT} skills validated with shareable artifacts.`);
