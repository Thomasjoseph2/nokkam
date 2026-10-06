import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthenticatedError } from '../../../shared/application/errors';
import { IS_PUBLIC_KEY } from '../../../shared/presentation/http/decorators/public.decorator';
import type { AuthenticatedRequest } from '../../../shared/presentation/http/request-context';
import { AccessTokenService } from '../application/ports/access-token-service';
import { AuthCookies } from './auth-cookies';

/**
 * Global guard: every route requires a valid access token unless marked @Public().
 * On public routes a valid token is still resolved (best effort) so handlers can personalise.
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: AccessTokenService,
    private readonly cookies: AuthCookies,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.cookies.readAccessToken(req);

    if (isPublic) {
      if (token) {
        try {
          req.actor = this.toActor(token);
        } catch {
          // ignore invalid/expired tokens on public routes
        }
      }
      return true;
    }

    if (!token) throw new UnauthenticatedError();
    req.actor = this.toActor(token);
    return true;
  }

  private toActor(token: string) {
    const claims = this.tokens.verify(token);
    return { userId: claims.userId, roles: claims.roles, sessionId: claims.sessionId };
  }
}
