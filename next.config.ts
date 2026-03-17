import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'phkayfagsmgmlegpapua.supabase.co',
      },
    ],
  },
};

export default nextConfig;
