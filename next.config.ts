import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during build since we have config compatibility issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows the build to continue even if there are TypeScript errors
    // Set to false in production for strict type checking
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
