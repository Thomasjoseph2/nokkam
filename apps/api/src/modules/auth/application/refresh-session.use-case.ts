import { Injectable } from '@nestjs/common';
import type { RequestMeta } from '../../../shared/application/actor';
import { AuditLog } from '../../../shared/application/audit-log';
import { Clock } from '../../../shared/application/clock';
import { UnauthenticatedError } from '../../../shared/application/errors';
import { UserRepository } from '../../users/domain/user.repository';
import { SessionRevokedError } from '../domain/auth.errors';
import { SessionRevocationReason } from '../domain/refresh-session';
import { RefreshSessionRepository } from '../domain/refresh-session.repository';
import { AuthSettings } from './auth-settings';
import { OpaqueTokenService } from './ports/opaque-token-service';
import type { AuthResult } from './register-user.use-case';
import { SessionIssuer } from './session-issuer';

/**
 * Refresh-token rotation with reuse detection.
 *
 * Every refresh consumes the presented token and issues a new one in the same family.
 * If a token that was rotated *outside* the grace window is presented again, it has most
 * likely been stolen and replayed: the whole family is revoked, logging out both parties.
 */
@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly sessions: RefreshSessionRepository,
    private readonly users: UserRepository,
    private readonly opaqueTokens: OpaqueTokenService,
    private readonly issuer: SessionIssuer,
    private readonly audit: AuditLog,
    private readonly clock: Clock,
    private readonly settings: AuthSettings,
  ) {}

  async execute(rawToken: string | undefined, meta: RequestMeta): Promise<AuthResult> {
    if (!rawToken) throw new UnauthenticatedError();
    const now = this.clock.now();

    const session = await this.sessions.findByTokenHash(this.opaqueTokens.hash(rawToken));
    if (!session) throw new UnauthenticatedError();

    switch (session.stateAt(now, this.settings.refreshReuseGraceMs)) {
      case 'REVOKED':
        throw new SessionRevokedError();
      case 'EXPIRED':
        throw new UnauthenticatedError('Session expired, please sign in again');
      case 'REUSED':
        await this.sessions.revokeFamily(
          session.familyId,
          SessionRevocationReason.REUSE_DETECTED,
          now,
        );
        await this.audit.record({
          actorId: session.userId,
          action: 'auth.refresh.reuse_detected',
          resourceType: 'session',
          resourceId: session.familyId,
          requestId: meta.requestId,
          ip: meta.ip,
        });
        throw new SessionRevokedError();
      case 'ACTIVE':
        // Losing this race just means a parallel request rotated first: same as in-grace.
        await this.sessions.markRotated(session.id, now);
        break;
      case 'ROTATED_IN_GRACE':
        break;
    }

    const user = await this.users.findById(session.userId);
    if (!user || user.isSuspended) {
      const reason = user
        ? SessionRevocationReason.ACCOUNT_SUSPENDED
        : SessionRevocationReason.USER_UNAVAILABLE;
      await this.sessions.revokeFamily(session.familyId, reason, now);
      throw new SessionRevokedError();
    }

    return { user, session: await this.issuer.issue(user, meta, session.familyId) };
  }
}
