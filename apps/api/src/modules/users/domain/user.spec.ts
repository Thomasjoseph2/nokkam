import { Email } from '../../../shared/domain/email';
import { InvalidValueError } from '../../../shared/domain/errors';
import { UserRole } from '../../../shared/domain/user-role';
import { User } from './user';
import { AccountSuspendedError, InvalidUserStateError } from './user.errors';
import { UserStatus } from './user-status';

const now = new Date('2026-10-01T10:00:00Z');
const later = new Date('2026-10-02T10:00:00Z');

function register(role: typeof UserRole.TESTER | typeof UserRole.BUSINESS_OWNER = UserRole.TESTER) {
  return User.register({
    id: 'u1',
    email: Email.create('asha@example.com'),
    passwordHash: 'hash',
    displayName: '  Asha   K ',
    role,
    now,
  });
}

describe('User', () => {
  it('registers as an active, unverified tester', () => {
    const user = register();
    expect(user.roles).toEqual([UserRole.TESTER]);
    expect(user.status).toBe(UserStatus.ACTIVE);
    expect(user.isEmailVerified).toBe(false);
    expect(user.displayName).toBe('Asha K');
    expect(user.version).toBe(0);
  });

  it('gives business owners the tester role as well', () => {
    expect(register(UserRole.BUSINESS_OWNER).roles).toEqual([
      UserRole.TESTER,
      UserRole.BUSINESS_OWNER,
    ]);
  });

  it('rejects display names outside 2-60 characters', () => {
    expect(() =>
      User.register({
        id: 'u1',
        email: Email.create('a@b.io'),
        passwordHash: 'h',
        displayName: 'A',
        role: UserRole.TESTER,
        now,
      }),
    ).toThrow(InvalidValueError);
  });

  it('verifies email idempotently, keeping the first timestamp', () => {
    const user = register();
    user.verifyEmail(now);
    user.verifyEmail(later);
    expect(user.emailVerifiedAt).toEqual(now);
  });

  it('blocks authentication while suspended and allows it after reactivation', () => {
    const user = register();
    user.suspend(later);
    expect(() => user.assertCanAuthenticate()).toThrow(AccountSuspendedError);
    expect(() => user.suspend(later)).toThrow(InvalidUserStateError);
    user.reactivate(later);
    expect(() => user.assertCanAuthenticate()).not.toThrow();
  });

  it('grants roles without duplicates', () => {
    const user = register();
    user.grantRole(UserRole.ADMIN, later);
    user.grantRole(UserRole.ADMIN, later);
    expect(user.roles).toEqual([UserRole.TESTER, UserRole.ADMIN]);
    expect(user.updatedAt).toEqual(later);
  });

  it('does not leak internal state through toProps()', () => {
    const user = register();
    (user.toProps().roles as string[]).push(UserRole.ADMIN);
    expect(user.hasRole(UserRole.ADMIN)).toBe(false);
  });
});
