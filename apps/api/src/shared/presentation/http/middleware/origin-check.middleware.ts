import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { ApiFailure } from '@nokkam/shared-types';
import { AppConfig } from '../../../config/app-config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence-in-depth for cookie-authenticated requests.
 *
 * Auth cookies are SameSite=Lax, which already stops cross-site POSTs carrying cookies in
 * modern browsers. Additionally, any state-changing request that declares an Origin must come
 * from an allowed origin. Requests without an Origin header (server-to-server, curl, the
 * Next.js server) are not browser-initiated cross-site requests and are allowed through;
 * they still need valid credentials.
 */
@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
  private readonly allowed: ReadonlySet<string>;

  constructor(config: AppConfig) {
    this.allowed = new Set(config.cors.origins.map((origin) => origin.replace(/\/$/, '')));
  }

  use(req: Request & { id?: unknown }, res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.headers.origin;
    if (!origin || this.allowed.has(origin)) return next();

    const body: ApiFailure = {
      error: {
        code: 'FORBIDDEN',
        message: 'Origin not allowed',
        requestId: req.id ? String(req.id) : undefined,
      },
    };
    res.status(403).json(body);
  }
}
