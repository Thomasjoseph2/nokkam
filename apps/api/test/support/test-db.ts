import { randomUUID } from 'node:crypto';
import mongoose, { type Connection } from 'mongoose';

/** URI of a fresh, uniquely named database on the test replica set. */
export function uniqueDatabaseUri(): string {
  const base = process.env.TEST_MONGODB_URI;
  if (!base) throw new Error('TEST_MONGODB_URI not set (global setup did not run)');
  const url = new URL(base);
  url.pathname = `/test_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  return url.toString();
}

export async function connectTestDatabase(): Promise<Connection> {
  return mongoose.createConnection(uniqueDatabaseUri()).asPromise();
}

export async function dropAndClose(connection: Connection): Promise<void> {
  await connection.dropDatabase();
  await connection.close();
}
