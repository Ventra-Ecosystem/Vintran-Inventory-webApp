import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',   // Enables minimal Docker image (no node_modules at runtime)

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  /**
   * Proxy all /api-proxy/* requests server-side to the HTTP backend.
   * This solves the "mixed content" problem: the deployed web app is HTTPS
   * but the backend only speaks HTTP. Browsers block HTTPS → HTTP requests,
   * so we route everything through Next.js server (which can talk HTTP freely).
   *
   * Usage: set NEXT_PUBLIC_API_URL=/api-proxy in production .env
   */
  async rewrites() {
    const backendBase =
      process.env.NEXT_SERVER_API_URL ?? // private, server-only var (preferred)
      process.env.NEXT_PUBLIC_API_URL ?? // fallback
      'http://152.53.108.33:5100';

    // Only add proxy rewrites when the backend URL is absolute (has a host).
    // In local dev you can point NEXT_PUBLIC_API_URL directly at localhost.
    if (!backendBase.startsWith('http')) return [];

    return [
      {
        source: '/api-proxy/:path*',
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
