import { Injectable } from '@nestjs/common';
import type { RequestMeta } from '../../../shared/application/actor';
import { AuditLog } from '../../../shared/application/audit-log';
import { Clock } from '../../../shared/application/clock';
import { SessionRevocationReason } from '../domain/refresh-session';
import { RefreshSessionRepository } from '../domain/refresh-session.repository';
import { OpaqueTokenService } from './ports/opaque-token-service';

/** Revokes the refresh-token family of the current sign-in. Idempotent. */
@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessions: RefreshSessionRepository,
    private readonly opaqueTokens: OpaqueTokenService,
    private readonly audit: AuditLog,
    private readonly clock: Clock,
  ) {}

  async execute(rawToken: string | undefined, meta: RequestMeta): Promise<void> {
    if (!rawToken) return;
    const session = await this.sessions.findByTokenHash(this.opaqueTokens.hash(rawToken));
    if (!session) return;

    await this.sessions.revokeFamily(
      session.familyId,
      SessionRevocationReason.LOGOUT,
      this.clock.now(),
    );
    await this.audit.record({
      actorId: session.userId,
      action: 'auth.logout',
      resourceType: 'session',
      resourceId: session.familyId,
      requestId: meta.requestId,
      ip: meta.ip,
    });
  }
}
