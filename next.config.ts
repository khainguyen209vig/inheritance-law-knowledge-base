import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
