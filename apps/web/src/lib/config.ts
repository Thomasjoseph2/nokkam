/** Public site URL (canonical URLs, sitemap, Open Graph). */
export const SITE_URL = (process.env.WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** API base URL for server-side calls from the Next.js server (never sent to the browser). */
export const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export const SITE_NAME = 'Nokkam';
export const SITE_TAGLINE =
  'Try new local places. Get a real offer. Share honest, private feedback.';
