import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  poweredByHeader: false,
  outputFileTracingExcludes: {
    "/*": [
      "./.local/**/*",
      "./.env*",
      "./docs/**/*",
      "./tests/**/*",
      "./test-results/**/*",
      "./playwright-report/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
