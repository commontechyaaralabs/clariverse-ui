import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useLightningcss: false,
    optimizeCss: false,
  },
};

export default nextConfig;
