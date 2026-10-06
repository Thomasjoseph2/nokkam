import { Schema } from 'mongoose';

export const AUDIT_LOG_MODEL = 'AuditLog';

export interface AuditLogRecord {
  _id: string;
  actorId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  requestId: string | null;
  ip: string | null;
  createdAt: Date;
}

export const AuditLogSchema = new Schema<AuditLogRecord>(
  {
    _id: { type: String, required: true },
    actorId: { type: String, default: null },
    action: { type: String, required: true },
    resourceType: { type: String, default: null },
    resourceId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    requestId: { type: String, default: null },
    ip: { type: String, default: null },
    createdAt: { type: Date, required: true },
  },
  { collection: 'audit_logs', versionKey: false },
);

AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
