import { type Connection, type Model, Schema } from 'mongoose';
import { MongoTransactionManager } from '../../src/shared/infrastructure/database/mongo-transaction-manager';
import { MongoSessionContext } from '../../src/shared/infrastructure/database/mongo-session-context';
import { connectTestDatabase, dropAndClose } from '../support/test-db';

describe('MongoTransactionManager', () => {
  let connection: Connection;
  let tx: MongoTransactionManager;
  interface Thing {
    _id: string;
    n: number;
  }
  let things: Model<Thing>;
  const Thing = () => things;

  beforeAll(async () => {
    connection = await connectTestDatabase();
    things = connection.model<Thing>(
      'Thing',
      new Schema<Thing>({ _id: String, n: Number }, { versionKey: false }),
    );
    await things.createCollection(); // collections cannot be created inside a transaction
    tx = new MongoTransactionManager(connection);
  });

  afterAll(() => dropAndClose(connection));

  const insert = (id: string) =>
    Thing().create([{ _id: id, n: 1 }], { session: MongoSessionContext.current() });

  it('commits all writes when the work succeeds', async () => {
    await tx.run(async () => {
      await insert('ok-1');
      await insert('ok-2');
    });
    expect(await Thing().countDocuments({ _id: { $in: ['ok-1', 'ok-2'] } })).toBe(2);
  });

  it('rolls back every write when the work throws', async () => {
    await expect(
      tx.run(async () => {
        await insert('rollback-1');
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(await Thing().countDocuments({ _id: 'rollback-1' })).toBe(0);
  });

  it('joins an outer transaction instead of nesting', async () => {
    await expect(
      tx.run(async () => {
        await tx.run(() => insert('nested-1'));
        throw new Error('outer fails');
      }),
    ).rejects.toThrow('outer fails');
    expect(await Thing().countDocuments({ _id: 'nested-1' })).toBe(0);
  });

  it('returns the work result', async () => {
    await expect(tx.run(async () => 42)).resolves.toBe(42);
  });
});
