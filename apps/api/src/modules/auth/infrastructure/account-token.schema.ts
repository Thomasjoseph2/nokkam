import { Schema } from 'mongoose';
import { AccountTokenPurpose } from '../domain/account-token';

export const ACCOUNT_TOKEN_MODEL = 'AccountToken';

export interface AccountTokenRecord {
  _id: string;
  userId: string;
  purpose: AccountTokenPurpose;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
}

export const AccountTokenSchema = new Schema<AccountTokenRecord>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    purpose: { type: String, enum: Object.values(AccountTokenPurpose), required: true },
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { collection: 'account_tokens', versionKey: false },
);

AccountTokenSchema.index({ tokenHash: 1 }, { unique: true });
AccountTokenSchema.index({ userId: 1, purpose: 1 });
AccountTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
