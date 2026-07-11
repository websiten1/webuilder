import * as Sentry from "@sentry/nextjs";

// No-ops if NEXT_PUBLIC_SENTRY_DSN is unset — safe to ship before a Sentry
// project exists, starts reporting the moment the DSN is added.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
