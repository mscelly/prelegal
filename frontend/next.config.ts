import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Built to static files in out/, which the FastAPI backend serves.
  output: "export",
  // Emit nda/index.html rather than nda.html so the backend finds it.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
