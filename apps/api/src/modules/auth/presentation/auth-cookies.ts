import { Injectable } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { AppConfig } from '../../../shared/config/app-config';
import type { IssuedSession } from '../application/session-issuer';

export const ACCESS_TOKEN_COOKIE = 'nk_at';
export const REFRESH_TOKEN_COOKIE = 'nk_rt';

/**
 * Tokens travel only in HTTP-only cookies, never in response bodies, so page scripts
 * (and any injected script) cannot read them. SameSite=Lax blocks cross-site POSTs.
 * The cookies are host-only on the web origin because the web app proxies /api/* to the API.
 */
@Injectable()
export class AuthCookies {
  constructor(private readonly config: AppConfig) {}

  set(res: Response, session: IssuedSession): void {
    res.cookie(ACCESS_TOKEN_COOKIE, session.accessToken, {
      ...this.base(),
      expires: session.accessTokenExpiresAt,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, session.refreshToken, {
      ...this.base(),
      expires: session.refreshTokenExpiresAt,
    });
  }

  clear(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.base());
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.base());
  }

  readAccessToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    // Bearer is accepted for non-browser clients (future mobile app, integrations).
    if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length).trim() || undefined;
    return readCookie(req, ACCESS_TOKEN_COOKIE);
  }

  readRefreshToken(req: Request): string | undefined {
    return readCookie(req, REFRESH_TOKEN_COOKIE);
  }

  private base(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.auth.cookieSecure,
      sameSite: 'lax',
      path: '/',
    };
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
