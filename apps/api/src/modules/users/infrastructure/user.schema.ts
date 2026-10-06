import { Schema } from 'mongoose';
import { USER_ROLES, type UserRole } from '../../../shared/domain/user-role';
import { UserStatus } from '../domain/user-status';

export const USER_MODEL = 'User';

/** Persistence shape. Kept separate from the domain entity on purpose. */
export interface UserRecord {
  _id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export const UserSchema = new Schema<UserRecord>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true },
    roles: { type: [String], enum: USER_ROLES, required: true },
    status: { type: String, enum: Object.values(UserStatus), required: true },
    emailVerifiedAt: { type: Date, default: null },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    version: { type: Number, required: true },
  },
  { collection: 'users', versionKey: false },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1, _id: -1 });
UserSchema.index({ roles: 1, status: 1 });
