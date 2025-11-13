import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useLightningcss: true,
    optimizeCss: true,
  },
};

export default nextConfig;
