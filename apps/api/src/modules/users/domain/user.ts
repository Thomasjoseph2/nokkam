import type { Email } from '../../../shared/domain/email';
import { InvalidValueError } from '../../../shared/domain/errors';
import { UserRole } from '../../../shared/domain/user-role';
import { AccountSuspendedError, InvalidUserStateError } from './user.errors';
import { UserStatus } from './user-status';

export type SelfRegistrationRole = typeof UserRole.TESTER | typeof UserRole.BUSINESS_OWNER;

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  displayName: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** Optimistic-concurrency version, incremented on every persisted change. */
  version: number;
}

/**
 * User aggregate: identity, credentials and account state.
 * Profile data that grows independently (location preferences, tester reputation, ...)
 * lives in separate aggregates keyed by userId, keeping this document small and hot.
 */
export class User {
  private constructor(private props: UserProps) {}

  static register(input: {
    id: string;
    email: Email;
    passwordHash: string;
    displayName: string;
    role: SelfRegistrationRole;
    now: Date;
  }): User {
    return new User({
      id: input.id,
      email: input.email,
      passwordHash: input.passwordHash,
      displayName: User.normaliseDisplayName(input.displayName),
      // Every account can take part in campaigns; business owners are testers too.
      roles:
        input.role === UserRole.BUSINESS_OWNER
          ? [UserRole.TESTER, UserRole.BUSINESS_OWNER]
          : [UserRole.TESTER],
      status: UserStatus.ACTIVE,
      emailVerifiedAt: null,
      createdAt: input.now,
      updatedAt: input.now,
      version: 0,
    });
  }

  /** Rehydrate from persistence. No invariants are re-run: stored state is trusted. */
  static restore(props: UserProps): User {
    return new User({ ...props, roles: [...props.roles] });
  }

  get id(): string {
    return this.props.id;
  }
  get email(): Email {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get displayName(): string {
    return this.props.displayName;
  }
  get roles(): readonly UserRole[] {
    return this.props.roles;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get emailVerifiedAt(): Date | null {
    return this.props.emailVerifiedAt;
  }
  get isEmailVerified(): boolean {
    return this.props.emailVerifiedAt !== null;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get version(): number {
    return this.props.version;
  }
  get isSuspended(): boolean {
    return this.props.status === UserStatus.SUSPENDED;
  }

  hasRole(role: UserRole): boolean {
    return this.props.roles.includes(role);
  }

  /** Guard used by authentication flows. */
  assertCanAuthenticate(): void {
    if (this.isSuspended) throw new AccountSuspendedError();
  }

  verifyEmail(now: Date): void {
    if (this.isEmailVerified) return; // idempotent
    this.props.emailVerifiedAt = now;
    this.touch(now);
  }

  grantRole(role: UserRole, now: Date): void {
    if (this.hasRole(role)) return;
    this.props.roles = [...this.props.roles, role];
    this.touch(now);
  }

  suspend(now: Date): void {
    if (this.isSuspended) throw new InvalidUserStateError('User is already suspended');
    this.props.status = UserStatus.SUSPENDED;
    this.touch(now);
  }

  reactivate(now: Date): void {
    if (!this.isSuspended) throw new InvalidUserStateError('User is not suspended');
    this.props.status = UserStatus.ACTIVE;
    this.touch(now);
  }

  changePasswordHash(passwordHash: string, now: Date): void {
    this.props.passwordHash = passwordHash;
    this.touch(now);
  }

  /** Snapshot for persistence mappers. */
  toProps(): Readonly<UserProps> {
    return { ...this.props, roles: [...this.props.roles] };
  }

  private touch(now: Date): void {
    this.props.updatedAt = now;
  }

  private static normaliseDisplayName(raw: string): string {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 60) {
      throw new InvalidValueError('Display name must be 2-60 characters', [
        { path: 'displayName', message: 'Must be 2-60 characters' },
      ]);
    }
    return name;
  }
}
