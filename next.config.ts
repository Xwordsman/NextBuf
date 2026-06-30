import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: process.env.DEPLOYMENT_VERSION,
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
  },
};

export default nextConfig;
