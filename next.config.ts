import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Preset design bundles are read from disk at runtime when deploying a
  // premium site — force-include them in the serverless function bundles.
  outputFileTracingIncludes: {
    "/api/generate-site": ["./public/preset-sites/**/*"],
    "/api/edits/process": ["./public/preset-sites/**/*"],
  },
};

// No-ops until SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN are set (only
// needed for source-map upload — error reporting itself just needs the DSN
// in instrumentation.ts / instrumentation-client.ts).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
});
