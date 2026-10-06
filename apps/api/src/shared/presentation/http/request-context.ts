import type { Request } from 'express';
import type { Actor, RequestMeta } from '../../application/actor';

/** Express request after authentication. `actor` is set by the access-token guard. */
export interface AuthenticatedRequest extends Request {
  id: string;
  actor?: Actor;
}

export function requestMetaFrom(req: AuthenticatedRequest): RequestMeta {
  const userAgent = req.headers['user-agent'];
  return {
    requestId: String(req.id ?? ''),
    ip: req.ip ?? null,
    userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 512) : null,
  };
}
