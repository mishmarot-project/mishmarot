import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mishmarot/shared",
    "@mishmarot/db",
    "@mishmarot/privacy",
  ],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
