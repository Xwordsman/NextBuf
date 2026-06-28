import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: process.env.DEPLOYMENT_VERSION,
  experimental:
    process.platform === "win32"
      ? {
          cpus: 4,
        }
      : undefined,
};

export default nextConfig;
