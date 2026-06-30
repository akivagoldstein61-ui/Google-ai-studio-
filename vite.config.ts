import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(process.env.VITE_COMMIT_SHA ?? process.env.GITHUB_SHA ?? ''),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(process.env.VITE_BUILD_TIME ?? ''),
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(process.env.VITE_GIT_BRANCH ?? process.env.GITHUB_REF_NAME ?? ''),
    'import.meta.env.VITE_DEPLOY_ENV': JSON.stringify(process.env.VITE_DEPLOY_ENV ?? ''),
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VITE_VERCEL_ENV ?? process.env.VERCEL_ENV ?? ''),
    'import.meta.env.VITE_VERCEL_TARGET_ENV': JSON.stringify(process.env.VITE_VERCEL_TARGET_ENV ?? process.env.VERCEL_TARGET_ENV ?? ''),
    'import.meta.env.VITE_VERCEL_URL': JSON.stringify(process.env.VITE_VERCEL_URL ?? process.env.VERCEL_URL ?? ''),
    'import.meta.env.VITE_VERCEL_BRANCH_URL': JSON.stringify(process.env.VITE_VERCEL_BRANCH_URL ?? process.env.VERCEL_BRANCH_URL ?? ''),
    'import.meta.env.VITE_VERCEL_PROJECT_PRODUCTION_URL': JSON.stringify(
      process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? ''
    ),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_REF': JSON.stringify(
      process.env.VITE_VERCEL_GIT_COMMIT_REF ?? process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME ?? ''
    ),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA': JSON.stringify(
      process.env.VITE_VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? ''
    ),
    'import.meta.env.VITE_VERCEL_GIT_PULL_REQUEST_ID': JSON.stringify(
      process.env.VITE_VERCEL_GIT_PULL_REQUEST_ID ?? process.env.VERCEL_GIT_PULL_REQUEST_ID ?? ''
    ),
  },
  server: {
    port: Number(process.env.PORT || 3000),
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
