import type { Connection } from 'mongoose';
import {
  RefreshSession,
  SessionRevocationReason,
} from '../../src/modules/auth/domain/refresh-session';
import { MongoRefreshSessionRepository } from '../../src/modules/auth/infrastructure/mongo-refresh-session.repository';
import {
  REFRESH_SESSION_MODEL,
  type RefreshSessionRecord,
  RefreshSessionSchema,
} from '../../src/modules/auth/infrastructure/refresh-session.schema';
import { connectTestDatabase, dropAndClose } from '../support/test-db';

const now = new Date('2026-10-01T10:00:00Z');

function session(id: string, familyId: string) {
  return RefreshSession.issue({
    id,
    familyId,
    userId: 'u1',
    tokenHash: `hash-${id}`,
    now,
    ttlMs: 86_400_000,
    userAgent: 'jest',
    ip: '127.0.0.1',
  });
}

describe('MongoRefreshSessionRepository', () => {
  let connection: Connection;
  let repo: MongoRefreshSessionRepository;

  beforeAll(async () => {
    connection = await connectTestDatabase();
    const model = connection.model<RefreshSessionRecord>(
      REFRESH_SESSION_MODEL,
      RefreshSessionSchema,
    );
    await model.syncIndexes();
    repo = new MongoRefreshSessionRepository(model);
  });

  afterAll(() => dropAndClose(connection));

  it('finds sessions by token hash', async () => {
    await repo.insert(session('s-find', 'f-find'));
    const found = await repo.findByTokenHash('hash-s-find');
    expect(found?.familyId).toBe('f-find');
    expect(found?.stateAt(now, 0)).toBe('ACTIVE');
  });

  it('lets exactly one concurrent caller rotate a token', async () => {
    await repo.insert(session('s-race', 'f-race'));
    const results = await Promise.all(
      Array.from({ length: 10 }, () => repo.markRotated('s-race', now)),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('revokes every token in a family and nothing else', async () => {
    await repo.insert(session('s-a1', 'f-a'));
    await repo.insert(session('s-a2', 'f-a'));
    await repo.insert(session('s-b1', 'f-b'));

    await repo.revokeFamily('f-a', SessionRevocationReason.LOGOUT, now);

    expect((await repo.findByTokenHash('hash-s-a1'))?.stateAt(now, 0)).toBe('REVOKED');
    expect((await repo.findByTokenHash('hash-s-a2'))?.stateAt(now, 0)).toBe('REVOKED');
    expect((await repo.findByTokenHash('hash-s-b1'))?.stateAt(now, 0)).toBe('ACTIVE');
    expect(await repo.markRotated('s-a1', now)).toBe(false);
  });
});
