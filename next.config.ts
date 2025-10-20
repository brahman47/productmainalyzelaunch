import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Set body size limit for API routes (Next.js 15)
  serverExternalPackages: ['formidable'],
};

export default nextConfig;
