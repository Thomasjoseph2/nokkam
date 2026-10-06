import { type AuditEntry, AuditLog } from '../../src/shared/application/audit-log';
import { Clock } from '../../src/shared/application/clock';
import { ConcurrentModificationError } from '../../src/shared/application/errors';
import { IdGenerator } from '../../src/shared/application/id-generator';
import { TransactionManager } from '../../src/shared/application/transaction-manager';
import type { Email } from '../../src/shared/domain/email';
import { User } from '../../src/modules/users/domain/user';
import { EmailAlreadyRegisteredError } from '../../src/modules/users/domain/user.errors';
import { type UserPage, UserRepository } from '../../src/modules/users/domain/user.repository';
import {
  RefreshSession,
  type SessionRevocationReason,
} from '../../src/modules/auth/domain/refresh-session';
import { RefreshSessionRepository } from '../../src/modules/auth/domain/refresh-session.repository';
import { PasswordHasher } from '../../src/modules/auth/application/ports/password-hasher';
import { OpaqueTokenService } from '../../src/modules/auth/application/ports/opaque-token-service';
import {
  type AccessTokenClaims,
  AccessTokenService,
  type IssuedAccessToken,
} from '../../src/modules/auth/application/ports/access-token-service';

/** In-memory adapters for fast, deterministic unit tests of use cases. */

export class FixedClock extends Clock {
  constructor(private current = new Date('2026-10-01T10:00:00.000Z')) {
    super();
  }
  now(): Date {
    return new Date(this.current);
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

export class SequentialIds extends IdGenerator {
  private next = 0;
  generate(): string {
    this.next += 1;
    return `id-${this.next}`;
  }
}

export class RecordingAuditLog extends AuditLog {
  readonly entries: AuditEntry[] = [];
  async record(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
  actions(): string[] {
    return this.entries.map((entry) => entry.action);
  }
}

export class PassthroughTransactions extends TransactionManager {
  run<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}

export class InMemoryUserRepository extends UserRepository {
  private readonly rows = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    const user = this.rows.get(id);
    return user ? User.restore(user.toProps()) : null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    const user = [...this.rows.values()].find((row) => row.email.equals(email));
    return user ? User.restore(user.toProps()) : null;
  }
  async insert(user: User): Promise<void> {
    if (await this.findByEmail(user.email)) throw new EmailAlreadyRegisteredError();
    this.rows.set(user.id, User.restore(user.toProps()));
  }
  async update(user: User): Promise<void> {
    const stored = this.rows.get(user.id);
    if (!stored || stored.version !== user.version) throw new ConcurrentModificationError('User');
    this.rows.set(user.id, User.restore({ ...user.toProps(), version: user.version + 1 }));
  }
  async list(): Promise<UserPage> {
    return { items: [...this.rows.values()], nextCursor: null };
  }
}

export class InMemoryRefreshSessionRepository extends RefreshSessionRepository {
  readonly rows = new Map<string, RefreshSession>();

  async insert(session: RefreshSession): Promise<void> {
    this.rows.set(session.id, session);
  }
  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    return [...this.rows.values()].find((row) => row.toProps().tokenHash === tokenHash) ?? null;
  }
  async markRotated(id: string, now: Date): Promise<boolean> {
    const row = this.rows.get(id);
    if (!row || row.toProps().rotatedAt || row.toProps().revokedAt) return false;
    this.rows.set(id, RefreshSession.restore({ ...row.toProps(), rotatedAt: now }));
    return true;
  }
  async revokeFamily(familyId: string, reason: SessionRevocationReason, now: Date): Promise<void> {
    for (const [id, row] of this.rows) {
      const props = row.toProps();
      if (props.familyId === familyId && !props.revokedAt) {
        this.rows.set(
          id,
          RefreshSession.restore({ ...props, revokedAt: now, revokedReason: reason }),
        );
      }
    }
  }
  async revokeAllForUser(
    userId: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<void> {
    for (const row of this.rows.values()) {
      if (row.userId === userId) await this.revokeFamily(row.familyId, reason, now);
    }
  }
  family(familyId: string): RefreshSession[] {
    return [...this.rows.values()].filter((row) => row.familyId === familyId);
  }
}

/** Deterministic "hash" so tests can reason about stored values. */
export class FakePasswordHasher extends PasswordHasher {
  dummyCalls = 0;
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async verify(hash: string, plain: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
  async verifyAgainstDummy(): Promise<void> {
    this.dummyCalls += 1;
  }
}

export class FakeOpaqueTokens extends OpaqueTokenService {
  private counter = 0;
  generate(): string {
    this.counter += 1;
    return `token-${this.counter}`;
  }
  hash(token: string): string {
    return `h(${token})`;
  }
}

export class FakeAccessTokens extends AccessTokenService {
  issue(claims: AccessTokenClaims): IssuedAccessToken {
    return { token: JSON.stringify(claims), expiresAt: new Date('2030-01-01T00:00:00Z') };
  }
  verify(token: string): AccessTokenClaims {
    return JSON.parse(token) as AccessTokenClaims;
  }
}
