import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { TransactionManager } from '../../application/transaction-manager';
import { MongoSessionContext } from './mongo-session-context';

@Injectable()
export class MongoTransactionManager extends TransactionManager {
  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }

  async run<T>(work: () => Promise<T>): Promise<T> {
    // Nested calls join the outer transaction instead of opening a new one.
    if (MongoSessionContext.current()) return work();

    // connection.transaction() retries on TransientTransactionError / UnknownTransactionCommitResult,
    // so `work` must be safe to re-run (it is: all state lives in the database).
    let result: T | undefined;
    await this.connection.transaction(
      async (session) => {
        result = await MongoSessionContext.run(session, work);
      },
      { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
    );
    return result as T;
  }
}
