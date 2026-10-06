import { existsSync } from 'node:fs';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

declare global {
  var __MONGO_REPLSET__: MongoMemoryReplSet | undefined;
}

/**
 * Starts a single-node in-memory replica set (transactions need a replica set).
 * Uses a locally installed mongod when available to avoid downloading a binary.
 * Set TEST_MONGODB_URI to run against an existing replica set instead.
 */
export default async function globalSetup(): Promise<void> {
  if (process.env.TEST_MONGODB_URI) return;
  if (!process.env.MONGOMS_SYSTEM_BINARY && existsSync('/usr/bin/mongod')) {
    process.env.MONGOMS_SYSTEM_BINARY = '/usr/bin/mongod';
  }
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  await replSet.waitUntilRunning();
  globalThis.__MONGO_REPLSET__ = replSet;
  process.env.TEST_MONGODB_URI = replSet.getUri();
}
