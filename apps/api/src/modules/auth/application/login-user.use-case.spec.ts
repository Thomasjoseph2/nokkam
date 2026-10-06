import { Email } from '../../../shared/domain/email';
import { UserRole } from '../../../shared/domain/user-role';
import {
  FakeAccessTokens,
  FakeOpaqueTokens,
  FakePasswordHasher,
  FixedClock,
  InMemoryRefreshSessionRepository,
  InMemoryUserRepository,
  RecordingAuditLog,
  SequentialIds,
} from '../../../../test/support/fakes';
import { User } from '../../users/domain/user';
import { AccountSuspendedError } from '../../users/domain/user.errors';
import { InvalidCredentialsError } from '../domain/auth.errors';
import { LoginUserUseCase } from './login-user.use-case';
import { SessionIssuer } from './session-issuer';

const meta = { requestId: 'req-1', ip: '127.0.0.1', userAgent: 'jest' };

async function setup() {
  const users = new InMemoryUserRepository();
  const hasher = new FakePasswordHasher();
  const clock = new FixedClock();
  const ids = new SequentialIds();
  const audit = new RecordingAuditLog();
  const sessions = new InMemoryRefreshSessionRepository();
  const issuer = new SessionIssuer(
    sessions,
    new FakeAccessTokens(),
    new FakeOpaqueTokens(),
    ids,
    clock,
    {
      refreshTokenTtlMs: 86_400_000,
      refreshReuseGraceMs: 30_000,
      emailVerificationTtlMs: 86_400_000,
    },
  );
  const user = User.register({
    id: 'u1',
    email: Email.create('asha@example.com'),
    passwordHash: await hasher.hash('correct horse'),
    displayName: 'Asha',
    role: UserRole.TESTER,
    now: clock.now(),
  });
  await users.insert(user);
  return {
    useCase: new LoginUserUseCase(users, hasher, issuer, audit),
    users,
    hasher,
    audit,
    sessions,
  };
}

describe('LoginUserUseCase', () => {
  it('issues a session for valid credentials and audits it', async () => {
    const { useCase, audit, sessions } = await setup();
    const result = await useCase.execute(
      { email: 'ASHA@example.com', password: 'correct horse' },
      meta,
    );
    expect(result.user.id).toBe('u1');
    expect(result.session.refreshToken).toBeDefined();
    expect(sessions.rows.size).toBe(1);
    expect(audit.actions()).toEqual(['auth.login.succeeded']);
  });

  it('rejects a wrong password with a generic error', async () => {
    const { useCase, audit } = await setup();
    await expect(
      useCase.execute({ email: 'asha@example.com', password: 'nope' }, meta),
    ).rejects.toThrow(InvalidCredentialsError);
    expect(audit.entries[0]).toMatchObject({
      action: 'auth.login.failed',
      metadata: { reason: 'bad_password' },
    });
  });

  it('rejects unknown emails with the same error and still spends hashing time', async () => {
    const { useCase, hasher } = await setup();
    await expect(
      useCase.execute({ email: 'who@example.com', password: 'x' }, meta),
    ).rejects.toThrow(InvalidCredentialsError);
    expect(hasher.dummyCalls).toBe(1);
  });

  it('only reveals suspension after a correct password', async () => {
    const { useCase, users } = await setup();
    const user = (await users.findById('u1'))!;
    user.suspend(new Date());
    await users.update(user);

    await expect(
      useCase.execute({ email: 'asha@example.com', password: 'wrong' }, meta),
    ).rejects.toThrow(InvalidCredentialsError);
    await expect(
      useCase.execute({ email: 'asha@example.com', password: 'correct horse' }, meta),
    ).rejects.toThrow(AccountSuspendedError);
  });
});
