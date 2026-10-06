import { Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UnauthenticatedError } from '../../../shared/application/errors';
import { AppConfig } from '../../../shared/config/app-config';
import { USER_ROLES, type UserRole } from '../../../shared/domain/user-role';
import {
  type AccessTokenClaims,
  AccessTokenService,
  type IssuedAccessToken,
} from '../application/ports/access-token-service';
import { AccessTokenExpiredError } from '../domain/auth.errors';

const ISSUER = 'nokkam-api';
const AUDIENCE = 'nokkam';

interface JwtPayload {
  sub: string;
  sid: string;
  roles: string[];
  exp: number;
}

@Injectable()
export class JwtAccessTokenService extends AccessTokenService {
  private readonly ttlSeconds: number;

  constructor(
    private readonly jwt: JwtService,
    config: AppConfig,
  ) {
    super();
    this.ttlSeconds = config.auth.accessTokenTtlSeconds;
  }

  issue(claims: AccessTokenClaims): IssuedAccessToken {
    const token = this.jwt.sign(
      { sid: claims.sessionId, roles: claims.roles },
      { subject: claims.userId, expiresIn: this.ttlSeconds, issuer: ISSUER, audience: AUDIENCE },
    );
    const { exp } = this.jwt.decode<JwtPayload>(token);
    return { token, expiresAt: new Date(exp * 1000) };
  }

  verify(token: string): AccessTokenClaims {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token, {
        algorithms: ['HS256'],
        issuer: ISSUER,
        audience: AUDIENCE,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) throw new AccessTokenExpiredError();
      throw new UnauthenticatedError('Invalid access token');
    }

    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((role): role is UserRole => USER_ROLES.includes(role as UserRole))
      : [];
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
      throw new UnauthenticatedError('Invalid access token');
    }
    return { userId: payload.sub, sessionId: payload.sid, roles };
  }
}
