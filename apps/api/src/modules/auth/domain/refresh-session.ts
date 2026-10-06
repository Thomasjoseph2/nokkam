export const SessionRevocationReason = {
  LOGOUT: 'LOGOUT',
  REUSE_DETECTED: 'REUSE_DETECTED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  USER_UNAVAILABLE: 'USER_UNAVAILABLE',
} as const;
export type SessionRevocationReason =
  (typeof SessionRevocationReason)[keyof typeof SessionRevocationReason];

/**
 * How a presented refresh token should be treated.
 *  ACTIVE              - normal rotation
 *  ROTATED_IN_GRACE    - already rotated moments ago (parallel tabs/requests); issue a sibling
 *  REUSED              - rotated long ago and presented again: likely stolen, kill the family
 *  REVOKED / EXPIRED   - reject
 */
export type RefreshTokenState = 'ACTIVE' | 'ROTATED_IN_GRACE' | 'REUSED' | 'REVOKED' | 'EXPIRED';

export interface RefreshSessionProps {
  id: string;
  /** All tokens descending from one sign-in share a family; revocation is per family. */
  familyId: string;
  userId: string;
  /** HMAC of the opaque token. The raw token is never stored. */
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  rotatedAt: Date | null;
  revokedAt: Date | null;
  revokedReason: SessionRevocationReason | null;
  userAgent: string | null;
  ip: string | null;
}

/** One refresh token in a rotating chain. */
export class RefreshSession {
  private constructor(private readonly props: RefreshSessionProps) {}

  static issue(input: {
    id: string;
    familyId: string;
    userId: string;
    tokenHash: string;
    now: Date;
    ttlMs: number;
    userAgent: string | null;
    ip: string | null;
  }): RefreshSession {
    return new RefreshSession({
      id: input.id,
      familyId: input.familyId,
      userId: input.userId,
      tokenHash: input.tokenHash,
      createdAt: input.now,
      expiresAt: new Date(input.now.getTime() + input.ttlMs),
      rotatedAt: null,
      revokedAt: null,
      revokedReason: null,
      userAgent: input.userAgent,
      ip: input.ip,
    });
  }

  static restore(props: RefreshSessionProps): RefreshSession {
    return new RefreshSession({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get familyId(): string {
    return this.props.familyId;
  }
  get userId(): string {
    return this.props.userId;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  stateAt(now: Date, reuseGraceMs: number): RefreshTokenState {
    if (this.props.revokedAt) return 'REVOKED';
    if (now.getTime() >= this.props.expiresAt.getTime()) return 'EXPIRED';
    if (this.props.rotatedAt) {
      return now.getTime() - this.props.rotatedAt.getTime() <= reuseGraceMs
        ? 'ROTATED_IN_GRACE'
        : 'REUSED';
    }
    return 'ACTIVE';
  }

  toProps(): Readonly<RefreshSessionProps> {
    return { ...this.props };
  }
}
