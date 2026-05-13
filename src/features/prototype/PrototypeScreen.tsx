import React, { useEffect, useState } from 'react';
import { ExternalLink, GitBranch, Globe, Info, Link2, Server, Sparkles } from 'lucide-react';
import { STABLE_PROTOTYPE_URL } from '@/lib/prototypeMode';
import { SKILLS } from '@/features/skills';

const GITHUB_REPO_URL = 'https://github.com/akivagoldstein61-ui/Google-ai-studio-';
const CI_BADGE_URL = `${GITHUB_REPO_URL}/actions/workflows/ci.yml/badge.svg`;
const DEPLOY_BADGE_URL = `${GITHUB_REPO_URL}/actions/workflows/deploy.yml/badge.svg`;

const env = import.meta.env;

type ServerBuildFingerprint = {
  status: string;
  source: string;
  generatedAt: string;
  repository: string;
  repositoryUrl: string;
  commitSha: string | null;
  shortCommitSha: string | null;
  commitUrl: string | null;
  branch: string | null;
  environment: string | null;
  targetEnvironment: string | null;
  pullRequestId: string | null;
  deploymentUrl: string | null;
  productionUrl: string | null;
  buildTime: string | null;
};

const COMMIT_SHA = env.VITE_VERCEL_GIT_COMMIT_SHA || env.VITE_COMMIT_SHA || '';
const BRANCH = env.VITE_VERCEL_GIT_COMMIT_REF || env.VITE_GIT_BRANCH || 'unknown';
const BUILD_TIME = env.VITE_BUILD_TIME || '';
const DEPLOYMENT_URL = env.VITE_VERCEL_URL ? `https://${env.VITE_VERCEL_URL}` : 'unknown';
const VERCEL_PRODUCTION_URL = env.VITE_VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VITE_VERCEL_PROJECT_PRODUCTION_URL}`
  : STABLE_PROTOTYPE_URL;
const NETLIFY_MIRROR_URL = env.VITE_NETLIFY_MIRROR_URL || '';
const NEON_MODE = env.VITE_DATABASE_MODE || 'none';
const SERVER_API_MODE = env.VITE_SERVER_API_MODE || 'static UI only';
const LAST_SMOKE_AT = env.VITE_LAST_SMOKE_TEST_AT || 'not available';
const SKILLS_HUB_URL = new URL('/skills-hub', STABLE_PROTOTYPE_URL).toString();
const SKILLS_ZIP_URL = new URL('/downloads/kesher-personality-skills.zip', STABLE_PROTOTYPE_URL).toString();
// SKILLS is the visible registry for this prototype surface. Count every
// visible module (prototype and planned), not only entries with a skillId,
// so /prototype mirrors everything reviewers can open in /skills-hub.
const REGISTERED_SKILL_COUNT = SKILLS.length;

const CURRENT_ENV =
  env.VITE_VERCEL_ENV ||
  env.VITE_DEPLOY_ENV ||
  (import.meta.env.DEV ? 'development' : 'unknown');

const rows: Array<{ label: string; value: React.ReactNode }> = [
  {
    label: 'Stable Vercel prototype URL',
    value: (
      <a href={STABLE_PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline inline-flex items-center gap-1">
        {STABLE_PROTOTYPE_URL}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ),
  },
  { label: 'Current environment', value: CURRENT_ENV },
  {
    label: 'GitHub repo',
    value: (
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline inline-flex items-center gap-1">
        {GITHUB_REPO_URL}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ),
  },
  {
    label: 'Kesher Skills Hub',
    value: (
      <a href={SKILLS_HUB_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline inline-flex items-center gap-1">
        {SKILLS_HUB_URL}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ),
  },
  {
    label: 'Prototype skills zip',
    value: (
      <a href={SKILLS_ZIP_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline inline-flex items-center gap-1">
        {SKILLS_ZIP_URL}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ),
  },
  { label: 'Branch', value: BRANCH },
  {
    label: 'Commit SHA',
    value: COMMIT_SHA ? (
      <a
        href={`${GITHUB_REPO_URL}/commit/${COMMIT_SHA}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[#C8956B] hover:underline"
      >
        {COMMIT_SHA}
      </a>
    ) : 'unknown',
  },
  { label: 'Build time', value: BUILD_TIME || 'unknown' },
  {
    label: 'Vercel deployment URL',
    value: DEPLOYMENT_URL !== 'unknown' ? (
      <a href={DEPLOYMENT_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline">
        {DEPLOYMENT_URL}
      </a>
    ) : 'unknown',
  },
  {
    label: 'Vercel production URL',
    value: (
      <a href={VERCEL_PRODUCTION_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline">
        {VERCEL_PRODUCTION_URL}
      </a>
    ),
  },
  { label: 'Netlify mirror URL', value: NETLIFY_MIRROR_URL || 'not configured yet' },
  { label: 'Neon mode', value: NEON_MODE },
  {
    label: 'Firebase auth-domain note',
    value: 'Only authorized domains can use Firebase sign-in. Preview/Netlify reviewers should use demo mode when needed.',
  },
  { label: 'Server/API mode', value: SERVER_API_MODE },
  { label: 'Last verified smoke-test timestamp', value: LAST_SMOKE_AT },
];

export const PrototypeScreen: React.FC = () => {
  const [serverFingerprint, setServerFingerprint] = useState<ServerBuildFingerprint | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch('/__version', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Version endpoint returned ${response.status}`);
        }
        return response.json() as Promise<ServerBuildFingerprint>;
      })
      .then((data) => {
        if (!ignore) {
          setServerFingerprint(data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setVersionError(error instanceof Error ? error.message : 'Unable to load server fingerprint');
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const visibleCommitSha = serverFingerprint?.commitSha || COMMIT_SHA || 'unknown';
  const visibleBranch = serverFingerprint?.branch || BRANCH;
  const visibleEnvironment = serverFingerprint?.environment || CURRENT_ENV;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926] px-4 py-8">
      <main className="max-w-4xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            <Info className="w-4 h-4" />
            Prototype deployment status
          </div>
          <h1 className="text-3xl font-serif italic">Kesher /prototype status</h1>
          <p className="text-sm text-[#6B5E52]">
            This page confirms what commit and environment are currently running on the stable prototype URL.
          </p>
          <p className="text-xs font-mono text-[#2D2926]" data-testid="prototype-commit-marker">
            Commit marker: {visibleCommitSha}
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#8C7E6E]">{row.label}</p>
                <div className="break-all">{row.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            <Server className="w-4 h-4" />
            Server fingerprint
          </div>
          <p className="text-sm text-[#6B5E52]">
            This is loaded live from <code className="font-mono text-[#2D2926]">/__version</code>, so it verifies the running deployment, not only the client bundle.
          </p>
          {versionError ? (
            <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              Could not load server fingerprint: {versionError}
            </p>
          ) : serverFingerprint ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#8C7E6E]">Server commit</p>
                <div className="break-all font-mono">
                  {serverFingerprint.commitUrl ? (
                    <a href={serverFingerprint.commitUrl} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline">
                      {serverFingerprint.commitSha}
                    </a>
                  ) : 'unknown'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#8C7E6E]">Server branch</p>
                <div>{visibleBranch}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#8C7E6E]">Server environment</p>
                <div>{visibleEnvironment}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#8C7E6E]">Server deployment URL</p>
                <div className="break-all">
                  {serverFingerprint.deploymentUrl ? (
                    <a href={serverFingerprint.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-[#C8956B] hover:underline">
                      {serverFingerprint.deploymentUrl}
                    </a>
                  ) : 'unknown'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6B5E52]">Loading server fingerprint…</p>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            <Globe className="w-4 h-4" />
            CI / deploy badges
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`${GITHUB_REPO_URL}/actions/workflows/ci.yml`} target="_blank" rel="noopener noreferrer">
              <img src={CI_BADGE_URL} alt="CI status" className="h-5" />
            </a>
            <a href={`${GITHUB_REPO_URL}/actions/workflows/deploy.yml`} target="_blank" rel="noopener noreferrer">
              <img src={DEPLOY_BADGE_URL} alt="Deploy status" className="h-5" />
            </a>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3 text-sm text-[#6B5E52]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            <Server className="w-4 h-4" />
            Known limitations
          </div>
          <ul className="list-disc pl-5 space-y-2">
            <li>Demo mode is for viewability and uses mock/local-only state (no Firestore writes).</li>
            <li>Netlify is configured as a static mirror and does not run Express API routes unless Functions are added.</li>
            <li>Preview deployments may not be Firebase-auth authorized; reviewers should use demo mode when sign-in is blocked.</li>
            <li>Production personality-sensitive features remain gated and must not be auto-enabled from previews.</li>
          </ul>
        </section>

        <section className="bg-[#2D2926] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            <Sparkles className="w-4 h-4" />
            <span>Kesher Skills Hub</span>
          </div>
          <p className="text-sm text-white/80 italic">Explore all {REGISTERED_SKILL_COUNT} registered skill modules powering Kesher's trust-forward personality system.</p>
          <a
            href="/skills-hub"
            data-testid="prototype-skills-hub-link"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#2D2926] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#E5C048] transition-all"
          >
            Open Skills Hub
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 text-xs text-[#8C7E6E] flex flex-wrap items-center gap-2">
          <GitBranch className="w-4 h-4" />
          <span>Vercel env: {env.VITE_VERCEL_ENV || 'n/a'}</span>
          <span>•</span>
          <span>Vercel target env: {env.VITE_VERCEL_TARGET_ENV || 'n/a'}</span>
          <span>•</span>
          <span>PR ID: {env.VITE_VERCEL_GIT_PULL_REQUEST_ID || 'n/a'}</span>
          <span>•</span>
          <Link2 className="w-3.5 h-3.5" />
          <a href={STABLE_PROTOTYPE_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            open stable app
          </a>
        </section>
      </main>
    </div>
  );
};
