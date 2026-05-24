/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_COMMIT_SHA: string;
  readonly VITE_BUILD_TIME: string;
  readonly VITE_GIT_BRANCH: string;
  readonly VITE_DEPLOY_ENV: string;
  readonly VITE_VERCEL_ENV: string;
  readonly VITE_VERCEL_TARGET_ENV: string;
  readonly VITE_VERCEL_URL: string;
  readonly VITE_VERCEL_BRANCH_URL: string;
  readonly VITE_VERCEL_PROJECT_PRODUCTION_URL: string;
  readonly VITE_VERCEL_GIT_COMMIT_REF: string;
  readonly VITE_VERCEL_GIT_COMMIT_SHA: string;
  readonly VITE_VERCEL_GIT_PULL_REQUEST_ID: string;
  readonly VITE_NETLIFY_MIRROR_URL: string;
  readonly VITE_DATABASE_MODE: string;
  readonly VITE_SERVER_API_MODE: string;
  readonly VITE_KESHER_ENABLE_MOCK_AUTH: string;
  readonly VITE_LAST_SMOKE_TEST_AT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
