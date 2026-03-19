import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mishmarot/shared",
    "@mishmarot/db",
    "@mishmarot/privacy",
  ],
};

export default nextConfig;
