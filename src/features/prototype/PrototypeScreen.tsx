import React from 'react';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  ExternalLink,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Settings,
  Shield,
  Users,
  Zap,
} from 'lucide-react';

const COMMIT_SHA: string = import.meta.env.VITE_COMMIT_SHA ?? '';
const BUILD_TIME: string = import.meta.env.VITE_BUILD_TIME ?? '';
const PROTOTYPE_URL = 'https://google-ai-studio-kesher.vercel.app';
const GITHUB_REPO_URL = 'https://github.com/akivagoldstein61-ui/Google-ai-studio-';

interface QuickLink {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ExecutionItem {
  label: string;
  status: 'done' | 'in_progress' | 'blocked';
  detail: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: 'Onboarding',
    description: 'Profile creation, opt-in assessment language, and preference setup',
    icon: Users,
  },
  {
    label: 'Daily Picks',
    description: 'Finite discovery feed with provenance-first match explanations',
    icon: Zap,
  },
  {
    label: 'AI & Trust Hub',
    description: 'Feature toggles, red lines, privacy controls, and personality disclosure',
    icon: Shield,
  },
  {
    label: 'Personality Reflection',
    description: 'Private-by-default reflection cards, not a compatibility oracle',
    icon: Brain,
  },
  {
    label: 'Safety Center',
    description: 'Safety, report/block/unmatch, and user-control flows',
    icon: LockKeyhole,
  },
  {
    label: 'Experiments',
    description: 'Validation, red-team, and release-gate tracking',
    icon: FlaskConical,
  },
];

const EXECUTION_ITEMS: ExecutionItem[] = [
  {
    label: 'Continuous Vercel prototype',
    status: 'done',
    detail: 'The Vercel project is connected to the GitHub repository. Pushes to main create production deployments; branch/PR pushes create preview deployments.',
  },
  {
    label: 'Personality launch posture',
    status: 'in_progress',
    detail: 'Prototype-only until instrument licensing, Israeli privacy counsel, provider-governance, and validation gates close.',
  },
  {
    label: 'No destiny scores',
    status: 'done',
    detail: 'Compatibility must be framed as reflection: shared foundations, communication tempo, repair readiness, and topics to clarify.',
  },
  {
    label: 'Permissioned sharing',
    status: 'in_progress',
    detail: 'Next implementation slice: consent receipts, grants ledger, share-card preview, expiry, revocation, and export/delete/reset cascade.',
  },
  {
    label: 'Sensitive AI runtime',
    status: 'blocked',
    detail: 'Production personality flows remain blocked until the final Vertex/enterprise-governed route and retention posture are approved.',
  },
];

export const PrototypeScreen: React.FC = () => {
  const shortSha = COMMIT_SHA ? COMMIT_SHA.slice(0, 7) : null;
  const buildDate = BUILD_TIME
    ? new Date(BUILD_TIME).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#2D2926] flex flex-col">
      <header className="bg-white border-b border-[#F3EFEA] px-6 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="inline-flex items-center gap-1.5 bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#43A047] animate-pulse" />
          LIVE — Prototype
        </span>
        <h1 className="text-xl font-serif italic text-[#2D2926] flex-1">Kesher</h1>
        <a
          href={PROTOTYPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-[#C8956B] hover:text-[#A67250] transition-colors"
        >
          Open app
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
        <section className="bg-[#2D2926] text-white rounded-[32px] p-7 space-y-5 overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="relative z-10 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <Brain className="w-6 h-6" />
            </span>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                Personality execution dashboard
              </p>
              <h2 className="text-3xl font-serif italic leading-tight">
                Prototype-only until the trust gates close.
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
                Kesher’s personality layer is being implemented as optional, private by default, reflective rather than predictive, and never as a soulmate score, marriage probability, hidden desirability ranking, or public raw-trait badge.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            Build info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetaItem
              icon={<GitBranch className="w-4 h-4 text-[#C8956B]" />}
              label="Production branch"
              value="main"
            />
            <MetaItem
              icon={<span className="text-[#C8956B] font-mono text-sm">#</span>}
              label="Commit"
              value={
                shortSha ? (
                  <a
                    href={`${GITHUB_REPO_URL}/commit/${COMMIT_SHA}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:underline text-[#C8956B]"
                  >
                    {shortSha}
                  </a>
                ) : (
                  <span className="text-[#9E8E7E] italic">dev build</span>
                )
              }
            />
            <MetaItem
              icon={<Clock className="w-4 h-4 text-[#C8956B]" />}
              label="Built at"
              value={buildDate ?? <span className="text-[#9E8E7E] italic">–</span>}
            />
            <MetaItem
              icon={<ExternalLink className="w-4 h-4 text-[#C8956B]" />}
              label="Stable URL"
              value={
                <a
                  href={PROTOTYPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline text-[#C8956B]"
                >
                  {PROTOTYPE_URL.replace('https://', '')}
                </a>
              }
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            Deployment contract
          </h2>
          <p className="text-sm text-[#6B5E52] leading-relaxed">
            This project is connected to Vercel as <strong>google-ai-studio-kesher</strong>. The production domain below serves the latest successful <code className="bg-[#F7F2EE] px-1.5 py-0.5 rounded text-xs font-mono">main</code> deployment. Pull requests receive their own Vercel preview URL, then the stable prototype updates after merge.
          </p>
          <a
            href={`${PROTOTYPE_URL}/prototype`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C8956B] hover:text-[#A67250]"
          >
            Open this prototype dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            Key flows to inspect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={PROTOTYPE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-[#F3EFEA] p-4 flex items-start gap-3 hover:border-[#C8956B] hover:shadow-sm transition-all group"
              >
                <span className="mt-0.5 p-2 rounded-xl bg-[#FDF5EE] group-hover:bg-[#FCEEE0] transition-colors">
                  <link.icon className="w-4 h-4 text-[#C8956B]" />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-[#2D2926] text-sm">{link.label}</div>
                  <div className="text-xs text-[#9E8E7E] mt-0.5 leading-relaxed">{link.description}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            Execution status
          </h2>
          <div className="space-y-3">
            {EXECUTION_ITEMS.map((item) => (
              <div key={item.label} className="flex gap-3 p-4 rounded-2xl bg-[#FDFCFB] border border-[#F3EFEA]">
                <StatusIcon status={item.status} />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#2D2926]">{item.label}</div>
                  <p className="text-xs text-[#6B5E52] leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            CI / CD
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href={`${GITHUB_REPO_URL}/actions/workflows/ci.yml`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`${GITHUB_REPO_URL}/actions/workflows/ci.yml/badge.svg`}
                alt="CI status"
                className="h-5"
              />
            </a>
            <a
              href={`${GITHUB_REPO_URL}/actions/workflows/deploy.yml`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`${GITHUB_REPO_URL}/actions/workflows/deploy.yml/badge.svg`}
                alt="Deploy status"
                className="h-5"
              />
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-[#C4B5A8] py-6">
        Prototype build · Kesher by Akiva Goldstein · GitHub → Vercel continuous deployment
      </footer>
    </div>
  );
};

interface MetaItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const MetaItem: React.FC<MetaItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <div className="text-xs text-[#9E8E7E] mb-0.5">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  </div>
);

const StatusIcon: React.FC<{ status: ExecutionItem['status'] }> = ({ status }) => {
  if (status === 'done') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />;
  }

  if (status === 'blocked') {
    return <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />;
  }

  return <Settings className="w-5 h-5 text-[#C8956B] mt-0.5 flex-shrink-0" />;
};
