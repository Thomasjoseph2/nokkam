import type { NextConfig } from 'next';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

// Single source of config for the monorepo: load the root .env without overriding real env vars.
const rootEnv = resolve(process.cwd(), '../../.env');
if (existsSync(rootEnv)) {
  for (const [key, value] of Object.entries(parseEnv(readFileSync(rootEnv, 'utf8')))) {
    process.env[key] ??= value;
  }
}

const apiUrl = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace package is compiled CommonJS; let Next bundle it like app code.
  transpilePackages: ['@nokkam/shared-types'],
  async rewrites() {
    // The browser only ever talks to the web origin. /api/v1/* is proxied to the API, so auth
    // cookies are first-party, host-only and never exposed cross-site.
    return [{ source: '/api/v1/:path*', destination: `${apiUrl}/api/v1/:path*` }];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Belt and braces next to the robots metadata on these pages.
      {
        source: '/dashboard/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
