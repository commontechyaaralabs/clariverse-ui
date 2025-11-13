import type { NextConfig } from "next";

if (!process.env.LIGHTNINGCSS_DISABLE_BINARY) {
  process.env.LIGHTNINGCSS_DISABLE_BINARY = "1";
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
