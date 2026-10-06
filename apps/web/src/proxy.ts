import { type NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'nk_at';
const REFRESH_COOKIE = 'nk_rt';
const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

/**
 * Optimistic session handling for the private area. The real authorisation check happens in
 * the API on every call; this only keeps navigation smooth:
 *  - no session cookies at all      -> redirect to /login
 *  - access cookie expired, refresh cookie present -> rotate tokens before rendering, so
 *    Server Components see a valid access token in the same request.
 */
export async function proxy(request: NextRequest) {
  if (request.cookies.has(ACCESS_COOKIE)) return NextResponse.next();
  if (!request.cookies.has(REFRESH_COOKIE)) return toLogin(request);

  const refreshed = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
      'user-agent': request.headers.get('user-agent') ?? '',
    },
  }).catch(() => null);
  if (!refreshed?.ok) return toLogin(request, true);

  const setCookies = refreshed.headers.getSetCookie();
  const requestCookies = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
  for (const header of setCookies) {
    const [pair] = header.split(';');
    const index = pair!.indexOf('=');
    requestCookies.set(pair!.slice(0, index), decodeURIComponent(pair!.slice(index + 1)));
  }

  const headers = new Headers(request.headers);
  headers.set('cookie', [...requestCookies].map(([name, value]) => `${name}=${value}`).join('; '));
  const response = NextResponse.next({ request: { headers } });
  for (const header of setCookies) response.headers.append('set-cookie', header);
  return response;
}

function toLogin(request: NextRequest, clearCookies = false) {
  const url = new URL('/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname);
  const response = NextResponse.redirect(url);
  if (clearCookies) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }
  return response;
}

export const config = { matcher: ['/dashboard/:path*', '/dashboard'] };
