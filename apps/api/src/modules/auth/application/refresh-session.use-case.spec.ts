import { UnauthenticatedError } from '../../../shared/application/errors';
import { Email } from '../../../shared/domain/email';
import { UserRole } from '../../../shared/domain/user-role';
import {
  FakeAccessTokens,
  FakeOpaqueTokens,
  FixedClock,
  InMemoryRefreshSessionRepository,
  InMemoryUserRepository,
  RecordingAuditLog,
  SequentialIds,
} from '../../../../test/support/fakes';
import { User } from '../../users/domain/user';
import { SessionRevokedError } from '../domain/auth.errors';
import type { AuthSettings } from './auth-settings';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { SessionIssuer } from './session-issuer';

const meta = { requestId: 'req-1', ip: null, userAgent: null };
const settings: AuthSettings = {
  refreshTokenTtlMs: 86_400_000,
  refreshReuseGraceMs: 30_000,
  emailVerificationTtlMs: 86_400_000,
};

async function setup() {
  const users = new InMemoryUserRepository();
  const sessions = new InMemoryRefreshSessionRepository();
  const clock = new FixedClock();
  const audit = new RecordingAuditLog();
  const opaque = new FakeOpaqueTokens();
  const issuer = new SessionIssuer(
    sessions,
    new FakeAccessTokens(),
    opaque,
    new SequentialIds(),
    clock,
    settings,
  );
  const user = User.register({
    id: 'u1',
    email: Email.create('asha@example.com'),
    passwordHash: 'h',
    displayName: 'Asha',
    role: UserRole.TESTER,
    now: clock.now(),
  });
  await users.insert(user);
  const initial = await issuer.issue(user, meta);
  const useCase = new RefreshSessionUseCase(
    sessions,
    users,
    opaque,
    issuer,
    audit,
    clock,
    settings,
  );
  return { useCase, sessions, users, clock, audit, initial };
}

describe('RefreshSessionUseCase', () => {
  it('rotates: returns a new refresh token in the same family', async () => {
    const { useCase, initial, sessions } = await setup();
    const result = await useCase.execute(initial.refreshToken, meta);

    expect(result.session.refreshToken).not.toBe(initial.refreshToken);
    const [first] = [...sessions.rows.values()];
    expect(sessions.family(first!.familyId)).toHaveLength(2);
  });

  it('tolerates a parallel refresh with the same token inside the grace window', async () => {
    const { useCase, initial, clock } = await setup();
    await useCase.execute(initial.refreshToken, meta);
    clock.advance(5_000);
    await expect(useCase.execute(initial.refreshToken, meta)).resolves.toBeDefined();
  });

  it('detects reuse after the grace window and revokes the whole family', async () => {
    const { useCase, initial, clock, sessions, audit } = await setup();
    const rotated = await useCase.execute(initial.refreshToken, meta);
    clock.advance(settings.refreshReuseGraceMs + 1);

    await expect(useCase.execute(initial.refreshToken, meta)).rejects.toThrow(SessionRevokedError);
    expect([...sessions.rows.values()].every((row) => row.toProps().revokedAt !== null)).toBe(true);
    expect(audit.actions()).toContain('auth.refresh.reuse_detected');
    // The legitimate holder of the newest token is logged out too.
    await expect(useCase.execute(rotated.session.refreshToken, meta)).rejects.toThrow(
      SessionRevokedError,
    );
  });

  it('rejects unknown and missing tokens', async () => {
    const { useCase } = await setup();
    await expect(useCase.execute('forged', meta)).rejects.toThrow(UnauthenticatedError);
    await expect(useCase.execute(undefined, meta)).rejects.toThrow(UnauthenticatedError);
  });

  it('rejects expired tokens', async () => {
    const { useCase, initial, clock } = await setup();
    clock.advance(settings.refreshTokenTtlMs);
    await expect(useCase.execute(initial.refreshToken, meta)).rejects.toThrow(UnauthenticatedError);
  });

  it('revokes the family when the user has been suspended', async () => {
    const { useCase, initial, users, clock } = await setup();
    const user = (await users.findById('u1'))!;
    user.suspend(clock.now());
    await users.update(user);

    await expect(useCase.execute(initial.refreshToken, meta)).rejects.toThrow(SessionRevokedError);
  });

  it('picks up role changes on refresh', async () => {
    const { useCase, initial, users, clock } = await setup();
    const user = (await users.findById('u1'))!;
    user.grantRole(UserRole.BUSINESS_OWNER, clock.now());
    await users.update(user);

    const result = await useCase.execute(initial.refreshToken, meta);
    expect(JSON.parse(result.session.accessToken).roles).toContain(UserRole.BUSINESS_OWNER);
  });
});
