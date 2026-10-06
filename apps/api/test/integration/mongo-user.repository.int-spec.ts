import type { Connection } from 'mongoose';
import { ConcurrentModificationError } from '../../src/shared/application/errors';
import { Email } from '../../src/shared/domain/email';
import { UserRole } from '../../src/shared/domain/user-role';
import { User } from '../../src/modules/users/domain/user';
import { EmailAlreadyRegisteredError } from '../../src/modules/users/domain/user.errors';
import { MongoUserRepository } from '../../src/modules/users/infrastructure/mongo-user.repository';
import {
  USER_MODEL,
  type UserRecord,
  UserSchema,
} from '../../src/modules/users/infrastructure/user.schema';
import { connectTestDatabase, dropAndClose } from '../support/test-db';

function newUser(id: string, email: string, createdAt = new Date('2026-10-01T10:00:00Z')) {
  return User.register({
    id,
    email: Email.create(email),
    passwordHash: 'hash',
    displayName: `User ${id}`,
    role: UserRole.TESTER,
    now: createdAt,
  });
}

describe('MongoUserRepository', () => {
  let connection: Connection;
  let repo: MongoUserRepository;

  beforeAll(async () => {
    connection = await connectTestDatabase();
    const model = connection.model<UserRecord>(USER_MODEL, UserSchema);
    await model.syncIndexes();
    repo = new MongoUserRepository(model);
  });

  afterAll(() => dropAndClose(connection));

  it('round-trips a user through persistence', async () => {
    await repo.insert(newUser('u-roundtrip', 'roundtrip@example.com'));
    const loaded = await repo.findByEmail(Email.create('ROUNDTRIP@example.com'));
    expect(loaded?.id).toBe('u-roundtrip');
    expect(loaded?.roles).toEqual([UserRole.TESTER]);
    expect(loaded?.email.value).toBe('roundtrip@example.com');
  });

  it('enforces unique emails at the database level', async () => {
    await repo.insert(newUser('u-dup-1', 'dup@example.com'));
    await expect(repo.insert(newUser('u-dup-2', 'dup@example.com'))).rejects.toThrow(
      EmailAlreadyRegisteredError,
    );
  });

  it('allows exactly one of many concurrent registrations for the same email', async () => {
    const attempts = Array.from({ length: 8 }, (_, i) =>
      repo.insert(newUser(`u-race-${i}`, 'race@example.com')),
    );
    const results = await Promise.allSettled(attempts);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(
      results.filter(
        (r) => r.status === 'rejected' && r.reason instanceof EmailAlreadyRegisteredError,
      ),
    ).toHaveLength(7);
  });

  it('applies optimistic concurrency on update', async () => {
    await repo.insert(newUser('u-occ', 'occ@example.com'));
    const first = (await repo.findById('u-occ'))!;
    const second = (await repo.findById('u-occ'))!;

    first.verifyEmail(new Date());
    await repo.update(first);

    second.grantRole(UserRole.ADMIN, new Date());
    await expect(repo.update(second)).rejects.toThrow(ConcurrentModificationError);

    const reloaded = (await repo.findById('u-occ'))!;
    expect(reloaded.version).toBe(1);
    expect(reloaded.isEmailVerified).toBe(true);
    expect(reloaded.hasRole(UserRole.ADMIN)).toBe(false);
  });

  it('paginates newest-first with stable cursors', async () => {
    const base = new Date('2030-01-01T00:00:00Z').getTime();
    for (let i = 0; i < 5; i++) {
      await repo.insert(newUser(`u-page-${i}`, `page${i}@example.com`, new Date(base + i * 1000)));
    }
    const first = await repo.list({ limit: 2 });
    expect(first.items.map((u) => u.id)).toEqual(['u-page-4', 'u-page-3']);
    const second = await repo.list({ limit: 2, cursor: first.nextCursor! });
    expect(second.items.map((u) => u.id)).toEqual(['u-page-2', 'u-page-1']);
  });
});
