export const STABLE_PROTOTYPE_URL =
  import.meta.env.VITE_STABLE_PROTOTYPE_URL ?? 'https://google-ai-studio-sage-sigma.vercel.app';

export const CANONICAL_ORIGIN = STABLE_PROTOTYPE_URL.replace(/\/$/, '');

export const AUTHORIZED_FIREBASE_HOSTNAMES = new Set([
  'google-ai-studio-sage-sigma.vercel.app',
  'gen-lang-client-0904321862.firebaseapp.com',
  'localhost',
  '127.0.0.1',
]);

const DEMO_SESSION_KEY = 'kesher.prototypeDemoMode';

export function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined';
}

export function isCurrentDomainFirebaseAuthorized(): boolean {
  if (!isBrowserRuntime()) return false;
  return AUTHORIZED_FIREBASE_HOSTNAMES.has(window.location.hostname);
}

export function isPrototypeDemoMode(): boolean {
  if (import.meta.env.VITE_PROTOTYPE_DEMO_MODE === 'true') return true;
  if (!isBrowserRuntime()) return false;

  const url = new URL(window.location.href);
  const demoParam = url.searchParams.get('demo');
  if (demoParam === '0' || demoParam === 'false') {
    window.sessionStorage?.removeItem(DEMO_SESSION_KEY);
    return false;
  }

  if (
    url.searchParams.has('demo') ||
    url.pathname === '/demo' ||
    url.pathname.startsWith('/demo/')
  ) {
    window.sessionStorage?.setItem(DEMO_SESSION_KEY, '1');
    return true;
  }

  if (window.sessionStorage?.getItem(DEMO_SESSION_KEY) === '1') {
    return true;
  }

  // Automatically enable demo mode on any domain that is not authorized for
  // Firebase Authentication (e.g. GitHub Spark, Codespaces, Netlify branch
  // previews). This surfaces the full UI prototype without requiring sign-in
  // or a running backend on any preview URL.
  return !isCurrentDomainFirebaseAuthorized();
}

export function getPrototypeDemoUrl(): string {
  const url = new URL(CANONICAL_ORIGIN);
  url.pathname = '/demo';
  url.searchParams.set('demo', '1');
  return url.toString();
}

export function redirectToCanonical(): void {
  if (!isBrowserRuntime()) return;
  const { pathname, search, hash } = window.location;
  window.location.replace(`${CANONICAL_ORIGIN}${pathname}${search}${hash}`);
}
