#!/usr/bin/env node
import { execFileSync } from "child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const GITHUB_SKILLS_URL = "https://github.com/akivagoldstein61-ui/Google-ai-studio-/tree/main/skills";

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

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const data = {};
  if (!match) return data;
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) data[field[1]] = field[2].trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extractStringField(block, field) {
  const match = block.match(new RegExp(`${field}:\\s*'((?:\\\\'|[^'])*)'`));
  return match ? match[1].replaceAll("\\'", "'").replaceAll('\\"', '"') : "";
}

function extractSkillCards() {
  const source = readFileSync(join(ROOT, "src/features/skills/SkillsHub.tsx"), "utf8");
  const start = source.indexOf("export const SKILLS");
  const assignment = source.indexOf("=", start);
  const arrayStart = source.indexOf("[", assignment);
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < source.length; i += 1) {
    if (source[i] === "[") depth += 1;
    if (source[i] === "]") depth -= 1;
    if (depth === 0) {
      arrayEnd = i;
      break;
    }
  }

  const body = source.slice(arrayStart + 1, arrayEnd);
  const blocks = [];
  let objectStart = -1;
  depth = 0;
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] === "{") {
      if (depth === 0) objectStart = i;
      depth += 1;
    } else if (body[i] === "}") {
      depth -= 1;
      if (depth === 0 && objectStart !== -1) {
        blocks.push(body.slice(objectStart, i + 1));
        objectStart = -1;
      }
    }
  }

  return blocks
    .map((block) => ({
      id: extractStringField(block, "id"),
      skillId: extractStringField(block, "skillId"),
      title: extractStringField(block, "title"),
      subtitle: extractStringField(block, "subtitle"),
      status: extractStringField(block, "status"),
      category: extractStringField(block, "category"),
      description: extractStringField(block, "description"),
    }))
    .filter((card) => card.id && card.title);
}

const skillFiles = walk(SKILLS_DIR, (filePath) => basename(filePath) === "SKILL.md").sort();
const skillRecords = skillFiles.map((filePath) => {
  const content = readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(content);
  return {
    name: frontmatter.name || basename(dirname(filePath)),
    description: frontmatter.description || "",
    path: relative(ROOT, filePath).replaceAll("\\", "/"),
    folder: basename(dirname(filePath)),
    content,
  };
});

const skillFolderSet = new Set(skillRecords.map((record) => record.folder));
const cards = extractSkillCards();
const statusCounts = cards.reduce((acc, card) => {
  acc[card.status] = (acc[card.status] || 0) + 1;
  return acc;
}, {});
const legacyArchives = readdirSync(SKILLS_DIR)
  .filter((entry) => entry.endsWith(".skill"))
  .sort();

const combinedMarkdown = [
  "# Kesher Skills - Full Shareable Markdown",
  "",
  "Generated from the repository `skills/` directory. Reference files remain in their extracted folders and the installable zip.",
  "",
  ...skillRecords.flatMap((record) => [
    "---",
    "",
    `# ${record.name}`,
    "",
    `Source: \`${record.path}\``,
    "",
    record.content.trimEnd(),
    "",
  ]),
].join("\n");

writeFileSync(join(ROOT, "kesher-skills-full.md"), `${combinedMarkdown}\n`);

const cardHtml = cards
  .map((card) => {
    const folder = card.skillId && skillFolderSet.has(card.skillId) ? card.skillId : "";
    const href = folder ? `${GITHUB_SKILLS_URL}/${folder}` : "/skills-hub";
    const linkText = folder ? "Open folder" : "Open in Skills Hub";
    return `<article class="skill"><div class="meta"><span>${escapeHtml(card.status)}</span><span>${escapeHtml(card.category || "uncategorized")}</span></div><h2>${escapeHtml(card.title)}</h2><p class="subtitle">${escapeHtml(card.subtitle)}</p><p>${escapeHtml(card.description)}</p><a href="${escapeHtml(href)}">${escapeHtml(linkText)}</a></article>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kesher Personality Skills Prototype</title>
    <style>
      :root { color-scheme: light; --ink:#1f2933; --muted:#62717f; --line:#d9e2ec; --paper:#fbfcfd; --panel:#ffffff; --accent:#126e82; --accent-2:#8a5a18; --soft:#eef8f9; }
      * { box-sizing: border-box; }
      body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:var(--paper); color:var(--ink); }
      header { border-bottom:1px solid var(--line); background:#ffffff; }
      .wrap { width:min(1120px, calc(100% - 32px)); margin:0 auto; }
      .hero { min-height:320px; display:grid; align-items:center; padding:56px 0 40px; }
      .eyebrow { margin:0 0 12px; font-size:12px; font-weight:800; letter-spacing:.08em; color:var(--accent); text-transform:uppercase; }
      h1 { max-width:860px; margin:0; font-size:clamp(36px, 6vw, 72px); line-height:.95; letter-spacing:0; }
      .intro { max-width:780px; margin:20px 0 0; font-size:18px; line-height:1.6; color:var(--muted); }
      .actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:28px; }
      .button { display:inline-flex; min-height:44px; align-items:center; justify-content:center; gap:8px; border:1px solid var(--accent); border-radius:8px; padding:10px 16px; color:#ffffff; background:var(--accent); font-weight:800; text-decoration:none; }
      .button.secondary { color:var(--accent); background:#ffffff; }
      main { padding:28px 0 56px; }
      .summary { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:12px; margin-bottom:28px; }
      .metric { border:1px solid var(--line); border-radius:8px; padding:16px; background:var(--panel); }
      .metric strong { display:block; font-size:28px; line-height:1; }
      .metric span { display:block; margin-top:6px; color:var(--muted); font-size:13px; }
      .grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:14px; }
      .skill { border:1px solid var(--line); border-radius:8px; background:var(--panel); padding:18px; }
      .skill h2 { margin:10px 0 6px; font-size:20px; letter-spacing:0; }
      .skill p { margin:0; color:var(--muted); line-height:1.55; }
      .subtitle { color:#314653 !important; font-size:13px; font-weight:800; }
      .meta { display:flex; flex-wrap:wrap; gap:8px; }
      .meta span { border-radius:999px; padding:5px 9px; color:var(--accent-2); background:#fff5e6; font-size:12px; font-weight:800; }
      .skill a { display:inline-block; margin-top:14px; color:var(--accent); font-weight:800; text-decoration:none; }
      .note { margin-top:28px; border:1px solid #b6e1e6; border-radius:8px; padding:16px; background:var(--soft); color:#254b54; line-height:1.5; }
      @media (max-width:780px) { .summary, .grid { grid-template-columns:1fr; } }
    </style>
  </head>
  <body>
    <header>
      <div class="wrap hero">
        <div>
          <p class="eyebrow">Kesher prototype asset</p>
          <h1>Personality feature skills bundle</h1>
          <p class="intro">A browsable prototype index for Kesher skill modules. The Codex archive ships installable <code>skill-folder/SKILL.md</code> skills; the full archive preserves the raw repository <code>/skills</code> folder, including legacy <code>.skill</code> bundles.</p>
          <div class="actions">
            <a class="button" href="/downloads/kesher-codex-skills-shareable.zip" download>Download Codex skills zip</a>
            <a class="button secondary" href="/downloads/kesher-personality-skills.zip" download>Download full /skills zip</a>
            <a class="button secondary" href="${GITHUB_SKILLS_URL}">View on GitHub</a>
            <a class="button secondary" href="/skills-hub">Open app Skills Hub</a>
          </div>
        </div>
      </div>
    </header>
    <main>
      <div class="wrap">
        <section class="summary" aria-label="Bundle summary">
          <div class="metric"><strong>${skillRecords.length}</strong><span>installable skill folders</span></div>
          <div class="metric"><strong>${cards.length}</strong><span>app hub modules</span></div>
          <div class="metric"><strong>${statusCounts.prototype || 0}</strong><span>prototype modules</span></div>
          <div class="metric"><strong>${statusCounts.planned || 0}</strong><span>planned modules</span></div>
        </section>
        <section class="grid" aria-label="Skills">
${cardHtml}
        </section>
        <p class="note">Personality remains a reflective, permissioned, private-by-default layer. This bundle intentionally preserves gates against LLM scoring, numeric fit claims, raw assessment-output exposure, and hidden personality-driven ordering.</p>
      </div>
    </main>
  </body>
</html>
`;

writeFileSync(join(ROOT, "public/prototype/skills.html"), html);

const zipPath = join(ROOT, "public/downloads/kesher-personality-skills.zip");
mkdirSync(dirname(zipPath), { recursive: true });
try {
  execFileSync("zip", ["-qr", zipPath, "skills", "-x", "*/.DS_Store"], { cwd: ROOT, stdio: "inherit" });
} catch (error) {
  console.error("Failed to build skills zip. Ensure the zip command is installed.");
  throw error;
}

const manifest = {
  name: "kesher-codex-skills",
  generatedAt: new Date().toISOString(),
  source: "https://github.com/akivagoldstein61-ui/Google-ai-studio-/tree/main/skills",
  installableSkillCount: skillRecords.length,
  appHubModuleCount: cards.length,
  legacyArchiveCount: legacyArchives.length,
  installableSkills: skillRecords.map(({ name, description, folder, path }) => ({
    name,
    description,
    folder,
    path,
  })),
  legacyArchives,
};

const manifestPath = join(ROOT, "public/downloads/kesher-codex-skills-manifest.json");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const shareableZipPath = join(ROOT, "public/downloads/kesher-codex-skills-shareable.zip");
const tempRoot = mkdtempSync(join(tmpdir(), "kesher-codex-skills-"));
const packageRoot = join(tempRoot, "kesher-codex-skills");
const packageSkillsDir = join(packageRoot, "skills");
mkdirSync(packageSkillsDir, { recursive: true });

for (const record of skillRecords) {
  cpSync(join(SKILLS_DIR, record.folder), join(packageSkillsDir, record.folder), {
    recursive: true,
    filter: (source) => !source.endsWith(".DS_Store"),
  });
}

writeFileSync(
  join(packageRoot, "INSTALL.md"),
  [
    "# Kesher Codex Skills",
    "",
    "Installable Codex skills generated from the Kesher repository `skills/` folders.",
    "",
    "## Install",
    "",
    "Copy each folder in `skills/` into your Codex skills directory:",
    "",
    "```sh",
    "mkdir -p ~/.codex/skills",
    "cp -R skills/* ~/.codex/skills/",
    "```",
    "",
    "Restart Codex to pick up new skills.",
    "",
    "The repository also ships `kesher-skills-full.md` for review and `manifest.json` for automation.",
    "",
  ].join("\n")
);
writeFileSync(join(packageRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
cpSync(join(ROOT, "kesher-skills-full.md"), join(packageRoot, "kesher-skills-full.md"));

try {
  execFileSync("zip", ["-qr", shareableZipPath, "kesher-codex-skills", "-x", "*/.DS_Store"], {
    cwd: tempRoot,
    stdio: "inherit",
  });
} catch (error) {
  console.error("Failed to build shareable Codex skills zip. Ensure the zip command is installed.");
  throw error;
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

console.log(`Built ${relative(ROOT, join(ROOT, "kesher-skills-full.md"))}`);
console.log(`Built ${relative(ROOT, join(ROOT, "public/prototype/skills.html"))}`);
console.log(`Built ${relative(ROOT, join(ROOT, "public/downloads/kesher-personality-skills.zip"))}`);
console.log(`Built ${relative(ROOT, shareableZipPath)}`);
console.log(`Built ${relative(ROOT, manifestPath)}`);
