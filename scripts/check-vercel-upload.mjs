#!/usr/bin/env node
import { existsSync, mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const uploadRoot = mkdtempSync(join(tmpdir(), 'kesher-vercel-upload-'));

const requiredRuntimeFiles = [
  'src/features/skills/index.ts',
  'src/features/skills/SkillsHub.tsx',
  'src/App.tsx',
  'src/ai/schemas.ts',
  'api/[...path].ts',
  'api/health.ts',
  'api/version.ts',
  'server.ts',
  'server/aiRoutes.ts',
  'firebase-applet-config.json',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'vercel.json',
];

const ignoredRuntimeCatalogs = [
  'skills',
  'skills 2',
  'skills 3',
  'skills 4',
  'public/downloads',
  '.claude/skills',
  '.github/skills',
  'kesher-app/skills',
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: {
      ...process.env,
      DISABLE_HMR: 'true',
    },
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function assertExists(root, filePath, label) {
  const absolutePath = join(root, filePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`${label} is missing from simulated Vercel upload: ${filePath}`);
  }
}

function assertAbsentWhenPresentInSource(filePath) {
  if (!existsSync(join(repoRoot, filePath))) {
    return;
  }

  if (existsSync(join(uploadRoot, filePath))) {
    throw new Error(`.vercelignore did not exclude non-runtime catalog: ${filePath}`);
  }
}

function ensureNodeModulesSymlink() {
  const sourceNodeModules = join(repoRoot, 'node_modules');
  const uploadNodeModules = join(uploadRoot, 'node_modules');

  if (!existsSync(sourceNodeModules)) {
    throw new Error('node_modules is missing; run npm ci before npm run check:vercel-upload');
  }
  if (!existsSync(uploadNodeModules)) {
    symlinkSync(realpathSync(sourceNodeModules), uploadNodeModules, process.platform === 'win32' ? 'junction' : 'dir');
  }
}

try {
  run('rsync', [
    '-a',
    '--delete',
    '--exclude-from=.vercelignore',
    '--exclude=.vercel',
    '--exclude=node_modules',
    '--exclude=dist',
    `${repoRoot}/`,
    `${uploadRoot}/`,
  ]);

  for (const filePath of requiredRuntimeFiles) {
    assertExists(uploadRoot, filePath, 'required runtime file');
  }

  for (const catalogPath of ignoredRuntimeCatalogs) {
    assertAbsentWhenPresentInSource(catalogPath);
  }

  ensureNodeModulesSymlink();
  mkdirSync(dirname(join(uploadRoot, 'dist/index.html')), { recursive: true });

  const viteBinary = join(
    repoRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'vite.cmd' : 'vite',
  );
  if (!existsSync(viteBinary)) {
    throw new Error('Vite binary is missing; run npm ci before npm run check:vercel-upload');
  }

  run(process.execPath, [viteBinary, 'build', '--outDir', 'dist', '--emptyOutDir'], { cwd: uploadRoot });

  console.log('✅ Simulated Vercel upload kept runtime files and built successfully');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`❌ Vercel upload check failed: ${message}`);
  process.exit(1);
} finally {
  rmSync(uploadRoot, { recursive: true, force: true });
}
