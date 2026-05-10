const GITHUB_REPO_URL = 'https://github.com/akivagoldstein61-ui/Google-ai-studio-';

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim() ?? '';
}

function normalizeHttpsUrl(hostOrUrl: string): string | null {
  if (!hostOrUrl) return null;
  if (hostOrUrl.startsWith('http://') || hostOrUrl.startsWith('https://')) return hostOrUrl;
  return `https://${hostOrUrl}`;
}

export default function handler(_request: unknown, response: any) {
  const commitSha = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.VITE_VERCEL_GIT_COMMIT_SHA,
    process.env.VITE_COMMIT_SHA
  );
  const branch = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_REF,
    process.env.GITHUB_REF_NAME,
    process.env.VITE_VERCEL_GIT_COMMIT_REF,
    process.env.VITE_GIT_BRANCH
  );
  const vercelUrl = firstNonEmpty(process.env.VERCEL_URL, process.env.VITE_VERCEL_URL);
  const productionUrl = firstNonEmpty(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL,
    'google-ai-studio-sage-sigma.vercel.app'
  );

  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.status(200).json({
    status: 'ok',
    source: 'vercel-api-function',
    generatedAt: new Date().toISOString(),
    repository: 'akivagoldstein61-ui/Google-ai-studio-',
    repositoryUrl: GITHUB_REPO_URL,
    commitSha: commitSha || null,
    shortCommitSha: commitSha ? commitSha.slice(0, 7) : null,
    commitUrl: commitSha ? `${GITHUB_REPO_URL}/commit/${commitSha}` : null,
    branch: branch || null,
    environment: firstNonEmpty(process.env.VERCEL_ENV, process.env.VITE_VERCEL_ENV, process.env.NODE_ENV) || null,
    targetEnvironment: firstNonEmpty(process.env.VERCEL_TARGET_ENV, process.env.VITE_VERCEL_TARGET_ENV) || null,
    pullRequestId: firstNonEmpty(process.env.VERCEL_GIT_PULL_REQUEST_ID, process.env.VITE_VERCEL_GIT_PULL_REQUEST_ID) || null,
    deploymentUrl: normalizeHttpsUrl(vercelUrl),
    productionUrl: normalizeHttpsUrl(productionUrl),
    buildTime: firstNonEmpty(process.env.VITE_BUILD_TIME, process.env.BUILD_TIME) || null,
  });
}
