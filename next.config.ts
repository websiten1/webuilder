import type { NextConfig } from "next";
import path from "path";

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

export default nextConfig;
