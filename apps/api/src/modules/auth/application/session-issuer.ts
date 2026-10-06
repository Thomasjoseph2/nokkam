import { Injectable } from '@nestjs/common';
import type { RequestMeta } from '../../../shared/application/actor';
import { Clock } from '../../../shared/application/clock';
import { IdGenerator } from '../../../shared/application/id-generator';
import type { User } from '../../users/domain/user';
import { RefreshSession } from '../domain/refresh-session';
import { RefreshSessionRepository } from '../domain/refresh-session.repository';
import { AuthSettings } from './auth-settings';
import { AccessTokenService } from './ports/access-token-service';
import { OpaqueTokenService } from './ports/opaque-token-service';

export interface IssuedSession {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

/** Issues an access token + a new refresh token, optionally continuing an existing family. */
@Injectable()
export class SessionIssuer {
  constructor(
    private readonly sessions: RefreshSessionRepository,
    private readonly accessTokens: AccessTokenService,
    private readonly opaqueTokens: OpaqueTokenService,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly settings: AuthSettings,
  ) {}

  async issue(user: User, meta: RequestMeta, familyId?: string): Promise<IssuedSession> {
    const now = this.clock.now();
    const refreshToken = this.opaqueTokens.generate();
    const session = RefreshSession.issue({
      id: this.ids.generate(),
      familyId: familyId ?? this.ids.generate(),
      userId: user.id,
      tokenHash: this.opaqueTokens.hash(refreshToken),
      now,
      ttlMs: this.settings.refreshTokenTtlMs,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });
    await this.sessions.insert(session);

    const access = this.accessTokens.issue({
      userId: user.id,
      sessionId: session.familyId,
      roles: [...user.roles],
    });

    return {
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
    };
  }
}
