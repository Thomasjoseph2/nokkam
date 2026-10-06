import type { RefreshSession, SessionRevocationReason } from './refresh-session';

export abstract class RefreshSessionRepository {
  abstract insert(session: RefreshSession): Promise<void>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshSession | null>;
  /**
   * Atomically marks a session as rotated. Returns false if it was already rotated or revoked
   * (i.e. another request won the race), so exactly one caller performs the "first" rotation.
   */
  abstract markRotated(id: string, now: Date): Promise<boolean>;
  abstract revokeFamily(
    familyId: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<void>;
  abstract revokeAllForUser(
    userId: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<void>;
}
