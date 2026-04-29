import React from 'react';
import { ExternalLink, GitBranch, Clock, Zap, Users, Shield, Settings, FlaskConical } from 'lucide-react';

const COMMIT_SHA: string = import.meta.env.VITE_COMMIT_SHA ?? '';
const BUILD_TIME: string = import.meta.env.VITE_BUILD_TIME ?? '';
const PROTOTYPE_URL = 'https://google-ai-studio-sage-sigma.vercel.app';

interface QuickLink {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: 'Onboarding',
    description: 'Profile creation & preference setup',
    icon: Users,
  },
  {
    label: 'Daily Picks',
    description: 'Discovery feed with AI match explanations',
    icon: Zap,
  },
  {
    label: 'Safety Center',
    description: 'Safety & moderation flows',
    icon: Shield,
  },
  {
    label: 'AI Ops',
    description: 'Admin AI feature health & status',
    icon: Settings,
  },
  {
    label: 'Experiments',
    description: 'Feature-flag experiments panel',
    icon: FlaskConical,
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
      {/* Header */}
      <header className="bg-white border-b border-[#F3EFEA] px-6 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="inline-flex items-center gap-1.5 bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#43A047] animate-pulse" />
          LIVE — Prototype (main)
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

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Build metadata */}
        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            Build info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetaItem
              icon={<GitBranch className="w-4 h-4 text-[#C8956B]" />}
              label="Branch"
              value="main"
            />
            <MetaItem
              icon={<span className="text-[#C8956B] font-mono text-sm">#</span>}
              label="Commit"
              value={
                shortSha ? (
                  <a
                    href={`https://github.com/akivagoldstein61-ui/Google-ai-studio-/commit/${COMMIT_SHA}`}
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

        {/* About */}
        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            About this build
          </h2>
          <p className="text-sm text-[#6B5E52] leading-relaxed">
            This is the continuously deployed prototype of <strong>Kesher</strong>. Every push to{' '}
            <code className="bg-[#F7F2EE] px-1.5 py-0.5 rounded text-xs font-mono">main</code> triggers a
            fresh Vercel deployment so this URL always reflects the latest running app UI. Use it for
            demos, QA, and design reviews.
          </p>
        </section>

        {/* Quick links */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            Key flows
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

        {/* CI status */}
        <section className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9E8E7E]">
            CI / CD
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href="https://github.com/akivagoldstein61-ui/Google-ai-studio-/actions/workflows/ci.yml"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://github.com/akivagoldstein61-ui/Google-ai-studio-/actions/workflows/ci.yml/badge.svg"
                alt="CI status"
                className="h-5"
              />
            </a>
            <a
              href="https://github.com/akivagoldstein61-ui/Google-ai-studio-/actions/workflows/deploy.yml"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://github.com/akivagoldstein61-ui/Google-ai-studio-/actions/workflows/deploy.yml/badge.svg"
                alt="Deploy status"
                className="h-5"
              />
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-[#C4B5A8] py-6">
        Prototype build · Kesher by Akiva Goldstein · Powered by Gemini + Vercel
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
