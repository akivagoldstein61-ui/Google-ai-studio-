#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "fs";
import { basename, join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");

function walk(dir, predicate, out = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, predicate, out);
    } else if (predicate(fullPath)) {
      out.push(fullPath);
    }
  }
  return out;
}

function parseFrontmatter(filePath) {
  const text = readFileSync(filePath, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error("missing YAML frontmatter");
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) {
      data[field[1]] = field[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return { data, text };
}

const skillFiles = walk(SKILLS_DIR, (filePath) => basename(filePath) === "SKILL.md").sort();
const failures = [];

for (const filePath of skillFiles) {
  const relPath = relative(ROOT, filePath);
  try {
    const { data, text } = parseFrontmatter(filePath);
    const folderName = basename(join(filePath, ".."));

    if (!data.name) failures.push(`${relPath}: missing frontmatter name`);
    if (!data.description) failures.push(`${relPath}: missing frontmatter description`);
    if (data.name && !/^[a-z0-9][a-z0-9-]*$/.test(data.name)) {
      failures.push(`${relPath}: name must use lowercase letters, digits, and hyphens`);
    }
    if (data.name && data.name !== folderName) {
      failures.push(`${relPath}: name "${data.name}" must match folder "${folderName}"`);
    }
    if (data.description && data.description.length < 40) {
      failures.push(`${relPath}: description is too short to trigger reliably`);
    }

    const referencesDir = join(filePath, "..", "references");
    try {
      const referenceFiles = walk(referencesDir, (candidate) => candidate.endsWith(".md"));
      for (const referenceFile of referenceFiles) {
        const referenceRel = relative(join(filePath, ".."), referenceFile).replaceAll("\\", "/");
        if (!text.includes(referenceRel)) {
          failures.push(`${relPath}: does not mention ${referenceRel}`);
        }
      }
    } catch {
      // References are optional.
    }
  } catch (error) {
    failures.push(`${relPath}: ${error.message}`);
  }
}

if (skillFiles.length === 0) {
  failures.push("No skills/**/SKILL.md files found");
}

if (failures.length > 0) {
  console.error("Skill validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${skillFiles.length} skill files.`);
