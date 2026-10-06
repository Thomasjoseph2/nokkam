import { AsyncLocalStorage } from 'node:async_hooks';
import type { ClientSession } from 'mongoose';

/**
 * Carries the active Mongo ClientSession through async calls so repositories can join
 * the ambient transaction without use cases passing sessions around.
 */
const storage = new AsyncLocalStorage<ClientSession>();

export const MongoSessionContext = {
  run<T>(session: ClientSession, work: () => Promise<T>): Promise<T> {
    return storage.run(session, work);
  },
  /** The session of the current transaction, or undefined outside a transaction. */
  current(): ClientSession | undefined {
    return storage.getStore();
  },
};
