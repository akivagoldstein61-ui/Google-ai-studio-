/**
 * Lightweight observability layer.
 *
 * - In production with `VITE_SENTRY_DSN` set, lazy-loads `@sentry/browser`.
 *   When that package isn't bundled (the default), the calls become no-ops
 *   so we don't ship a 100kb SDK to every user.
 * - Always emits structured `console.info` events with a `kesher_event` tag,
 *   which the Vercel log ingestor can route to BigQuery / Logflare / etc.
 * - Strips PII: never log email, phone, exact location, or message content.
 *
 * Usage:
 *   import { track, captureException } from '@/lib/observability';
 *   track('match_view', { matchId: id });
 *   captureException(err, { feature: 'compatibility_reflection' });
 */

type Primitive = string | number | boolean | null | undefined;
type Props = Record<string, Primitive | Primitive[]>;

const FORBIDDEN_KEYS = new Set([
  "email",
  "phone",
  "phoneNumber",
  "address",
  "street",
  "exactLocation",
  "lat",
  "lon",
  "latitude",
  "longitude",
  "messageText",
  "messageContent",
  "rawBio",
  "personality_scores",
]);

function sanitize(props?: Props): Props {
  if (!props) return {};
  const clean: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (FORBIDDEN_KEYS.has(k)) continue;
    // Drop strings longer than 200 chars (likely free-text content)
    if (typeof v === "string" && v.length > 200) {
      clean[k] = v.slice(0, 200) + "…";
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

interface SentryLite {
  captureException: (e: unknown, ctx?: any) => void;
  captureMessage: (msg: string, level?: string) => void;
  setUser?: (u: { id: string }) => void;
}

let sentry: SentryLite | null = null;

export async function initObservability() {
  if (typeof window === "undefined") return;
  const dsn = (import.meta as any).env?.VITE_SENTRY_DSN;
  const env = (import.meta as any).env?.MODE || "development";
  if (!dsn) return;

  try {
    // Dynamic import — only loaded if the package is installed AND DSN is set.
    // @ts-expect-error: optional peer dependency
    const mod = await import("@sentry/browser").catch(() => null);
    if (!mod) return;
    mod.init({
      dsn,
      environment: env,
      tracesSampleRate: env === "production" ? 0.1 : 0,
      // Never send raw user input — we filter at the SDK level too.
      beforeSend(event: any) {
        if (event.request?.cookies) delete event.request.cookies;
        if (event.user?.email) delete event.user.email;
        return event;
      },
    });
    sentry = mod as unknown as SentryLite;
  } catch {
    // Silent — observability degrades to console only
  }
}

export function track(eventName: string, props?: Props) {
  const sanitized = sanitize(props);
  // Always log structured event for log-aggregator pickup
  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      kesher_event: eventName,
      timestamp: new Date().toISOString(),
      ...sanitized,
    }),
  );
  if (sentry?.captureMessage) {
    try {
      sentry.captureMessage(eventName, "info");
    } catch {
      // swallow
    }
  }
}

export function captureException(err: unknown, context?: Props) {
  // eslint-disable-next-line no-console
  console.error("[exception]", err, sanitize(context));
  if (sentry?.captureException) {
    try {
      sentry.captureException(err, { extra: sanitize(context) });
    } catch {
      // swallow
    }
  }
}

export function setObservedUser(uid: string | null) {
  if (sentry?.setUser) {
    try {
      sentry.setUser(uid ? { id: uid } : { id: "anon" });
    } catch {
      // swallow
    }
  }
}
