import type { NextConfig } from "next"

/**
 * Lean config (aligned with panda/web).
 * Instant/cacheComponents was making every navigation wait on multi-second
 * "application-code" + params Suspense validation — removed.
 */
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
