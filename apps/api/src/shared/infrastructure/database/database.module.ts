import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionManager } from '../../application/transaction-manager';
import { AppConfig } from '../../config/app-config';
import { MongoTransactionManager } from './mongo-transaction-manager';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        uri: config.mongoUri,
        // Indexes are declared on schemas; build them automatically outside production.
        // In production, run index builds deliberately (see ARCHITECTURE.md › Indexes).
        autoIndex: !config.isProduction,
        serverSelectionTimeoutMS: 10_000,
      }),
    }),
  ],
  providers: [{ provide: TransactionManager, useClass: MongoTransactionManager }],
  exports: [TransactionManager],
})
export class DatabaseModule {}
