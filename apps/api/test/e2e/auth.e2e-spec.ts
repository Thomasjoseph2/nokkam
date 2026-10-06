import request from 'supertest';
import type { App } from 'supertest/types';
import { PasswordHasher } from '../../src/modules/auth/application/ports/password-hasher';
import { User } from '../../src/modules/users/domain/user';
import { UserRepository } from '../../src/modules/users/domain/user.repository';
import { Email } from '../../src/shared/domain/email';
import { UserRole } from '../../src/shared/domain/user-role';
import { createTestApp, type TestApp, WEB_ORIGIN } from '../support/test-app';

const api = (path: string) => `/api/v1${path}`;

function cookieNames(res: request.Response): string[] {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  return (raw ?? []).map((cookie) => cookie.split('=')[0]!);
}

describe('Auth & RBAC (e2e)', () => {
  let t: TestApp;
  let server: App;

  beforeAll(async () => {
    t = await createTestApp();
    server = t.app.getHttpServer() as App;
  });

  afterAll(() => t.close());

  it('reports health', async () => {
    const res = await request(server).get(api('/health')).expect(200);
    expect(res.body).toEqual({ data: { status: 'ok', database: 'up' } });
  });

  it('runs the full session lifecycle: register → me → refresh → logout', async () => {
    const agent = request.agent(server);

    const registered = await agent
      .post(api('/auth/register'))
      .set('Origin', WEB_ORIGIN)
      .send({
        email: 'Asha@Example.com',
        password: 'a-long-password',
        displayName: 'Asha',
        accountType: 'TESTER',
      })
      .expect(201);

    expect(registered.body.data.user).toMatchObject({
      email: 'asha@example.com',
      roles: ['TESTER'],
      emailVerified: false,
    });
    // Tokens are only ever delivered as HTTP-only cookies.
    expect(JSON.stringify(registered.body)).not.toMatch(/token"/i);
    expect(cookieNames(registered)).toEqual(expect.arrayContaining(['nk_at', 'nk_rt']));
    const rawCookies = (registered.headers['set-cookie'] as unknown as string[]).join(';');
    expect(rawCookies).toMatch(/HttpOnly/);
    expect(rawCookies).toMatch(/SameSite=Lax/);

    const me = await agent.get(api('/users/me')).expect(200);
    expect(me.body.data.email).toBe('asha@example.com');

    const refreshed = await agent.post(api('/auth/refresh')).set('Origin', WEB_ORIGIN).expect(200);
    expect(cookieNames(refreshed)).toEqual(expect.arrayContaining(['nk_at', 'nk_rt']));

    await agent.post(api('/auth/logout')).set('Origin', WEB_ORIGIN).expect(204);
    await agent.get(api('/users/me')).expect(401);
  });

  it('verifies email through the emailed single-use link', async () => {
    const agent = request.agent(server);
    await agent
      .post(api('/auth/register'))
      .send({
        email: 'verify@example.com',
        password: 'a-long-password',
        displayName: 'Vee',
        accountType: 'TESTER',
      })
      .expect(201);

    const token = t.emails.lastTokenFor('verify@example.com');
    expect(token).toBeDefined();

    const verified = await request(server)
      .post(api('/auth/verify-email'))
      .send({ token })
      .expect(200);
    expect(verified.body.data.emailVerified).toBe(true);

    const reused = await request(server)
      .post(api('/auth/verify-email'))
      .send({ token })
      .expect(422);
    expect(reused.body.error.code).toBe('INVALID_OR_EXPIRED_TOKEN');
  });

  it('rejects duplicate registration with a stable error code', async () => {
    const body = {
      email: 'dupe@example.com',
      password: 'a-long-password',
      displayName: 'Dupe',
      accountType: 'TESTER',
    };
    await request(server).post(api('/auth/register')).send(body).expect(201);
    const res = await request(server).post(api('/auth/register')).send(body).expect(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
    expect(res.body.error.requestId).toEqual(expect.any(String));
  });

  it('returns field-level validation errors', async () => {
    const res = await request(server)
      .post(api('/auth/register'))
      .send({ email: 'nope', password: 'short', displayName: 'X', accountType: 'ADMIN' })
      .expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.details.map((d: { path: string }) => d.path).sort()).toEqual(
      ['accountType', 'displayName', 'email', 'password'].sort(),
    );
  });

  it('does not reveal whether an email exists on failed login', async () => {
    const unknown = await request(server)
      .post(api('/auth/login'))
      .send({ email: 'ghost@example.com', password: 'whatever-123' })
      .expect(401);
    const wrong = await request(server)
      .post(api('/auth/login'))
      .send({ email: 'asha@example.com', password: 'wrong-password' })
      .expect(401);
    expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it('requires authentication by default', async () => {
    const res = await request(server).get(api('/users/me')).expect(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('enforces role-based access on admin routes', async () => {
    const tester = request.agent(server);
    await tester
      .post(api('/auth/login'))
      .send({ email: 'asha@example.com', password: 'a-long-password' })
      .expect(200);
    const forbidden = await tester.get(api('/admin/users')).expect(403);
    expect(forbidden.body.error.code).toBe('FORBIDDEN');

    // Admins are provisioned out-of-band (seed script), never self-registered.
    const users = t.app.get(UserRepository);
    const now = new Date();
    const admin = User.register({
      id: 'admin-e2e',
      email: Email.create('admin@example.com'),
      passwordHash: await t.app.get(PasswordHasher).hash('admin-password-1'),
      displayName: 'Admin',
      role: UserRole.TESTER,
      now,
    });
    admin.grantRole(UserRole.ADMIN, now);
    await users.insert(admin);

    const adminAgent = request.agent(server);
    await adminAgent
      .post(api('/auth/login'))
      .send({ email: 'admin@example.com', password: 'admin-password-1' })
      .expect(200);
    const list = await adminAgent.get(api('/admin/users?limit=2')).expect(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.meta.nextCursor).toEqual(expect.any(String));
    expect(list.body.data[0]).not.toHaveProperty('passwordHash');
  });

  it('blocks state-changing requests from foreign origins', async () => {
    const res = await request(server)
      .post(api('/auth/login'))
      .set('Origin', 'https://evil.example')
      .send({ email: 'asha@example.com', password: 'a-long-password' })
      .expect(403);
    expect(res.body.error).toMatchObject({ code: 'FORBIDDEN', requestId: expect.any(String) });
  });

  it('propagates a caller-supplied request id', async () => {
    const res = await request(server)
      .get(api('/health'))
      .set('X-Request-Id', 'trace-abc-12345')
      .expect(200);
    expect(res.headers['x-request-id']).toBe('trace-abc-12345');
  });
});
