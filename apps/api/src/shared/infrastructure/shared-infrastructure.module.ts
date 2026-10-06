import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog } from '../application/audit-log';
import { Clock } from '../application/clock';
import { IdGenerator } from '../application/id-generator';
import { AUDIT_LOG_MODEL, AuditLogSchema } from './audit/audit-log.schema';
import { MongoAuditLog } from './audit/mongo-audit-log';
import { SystemClock } from './system-clock';
import { UuidV7Generator } from './uuid-v7-generator';

/** Cross-cutting ports (clock, ids, audit) available to every module. */
@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: AUDIT_LOG_MODEL, schema: AuditLogSchema }])],
  providers: [
    { provide: Clock, useClass: SystemClock },
    { provide: IdGenerator, useClass: UuidV7Generator },
    { provide: AuditLog, useClass: MongoAuditLog },
  ],
  exports: [Clock, IdGenerator, AuditLog],
})
export class SharedInfrastructureModule {}
