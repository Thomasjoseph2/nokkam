import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { type AuditEntry, AuditLog } from '../../application/audit-log';
import { Clock } from '../../application/clock';
import { IdGenerator } from '../../application/id-generator';
import { MongoSessionContext } from '../database/mongo-session-context';
import { AUDIT_LOG_MODEL, type AuditLogRecord } from './audit-log.schema';

@Injectable()
export class MongoAuditLog extends AuditLog {
  constructor(
    @InjectModel(AUDIT_LOG_MODEL) private readonly model: Model<AuditLogRecord>,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly logger: PinoLogger,
  ) {
    super();
    this.logger.setContext(MongoAuditLog.name);
  }

  async record(entry: AuditEntry): Promise<void> {
    const record: AuditLogRecord = {
      _id: this.ids.generate(),
      actorId: entry.actorId,
      action: entry.action,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
      requestId: entry.requestId ?? null,
      ip: entry.ip ?? null,
      createdAt: this.clock.now(),
    };
    // Mirror into the structured log so audit events are visible in log tooling too.
    this.logger.info({ audit: { ...record, _id: undefined } }, `audit: ${entry.action}`);
    await this.model.create([record], { session: MongoSessionContext.current() });
  }
}
