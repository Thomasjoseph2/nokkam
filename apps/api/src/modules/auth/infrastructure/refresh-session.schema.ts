import { Schema } from 'mongoose';
import { SessionRevocationReason } from '../domain/refresh-session';

export const REFRESH_SESSION_MODEL = 'RefreshSession';

export interface RefreshSessionRecord {
  _id: string;
  familyId: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  rotatedAt: Date | null;
  revokedAt: Date | null;
  revokedReason: SessionRevocationReason | null;
  userAgent: string | null;
  ip: string | null;
}

export const RefreshSessionSchema = new Schema<RefreshSessionRecord>(
  {
    _id: { type: String, required: true },
    familyId: { type: String, required: true },
    userId: { type: String, required: true },
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    rotatedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, enum: Object.values(SessionRevocationReason), default: null },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { collection: 'refresh_sessions', versionKey: false },
);

RefreshSessionSchema.index({ tokenHash: 1 }, { unique: true });
RefreshSessionSchema.index({ familyId: 1 });
RefreshSessionSchema.index({ userId: 1 });
// MongoDB TTL monitor purges sessions once they expire.
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
