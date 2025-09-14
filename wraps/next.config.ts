import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  eslint: {
    // ✅ Skip ESLint during builds on Vercel
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
