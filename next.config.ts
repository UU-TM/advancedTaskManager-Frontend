import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiOrigin =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@excalidraw/excalidraw"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Browser is opened on 127.0.0.1 while the dev server is localhost (or the reverse).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Browser calls stay on this origin. The API sends
  // Cross-Origin-Resource-Policy: same-origin and only allows
  // http://localhost:3001, so a direct fetch from 127.0.0.1 fails.
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
