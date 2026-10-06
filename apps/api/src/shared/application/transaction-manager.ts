/**
 * Runs a unit of work atomically. Repositories invoked inside `run` automatically
 * participate in the same transaction (the session is propagated implicitly),
 * so use cases never handle database sessions directly.
 */
export abstract class TransactionManager {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}
