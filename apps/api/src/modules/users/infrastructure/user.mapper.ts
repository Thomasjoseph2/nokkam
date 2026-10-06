import { Email } from '../../../shared/domain/email';
import { User } from '../domain/user';
import type { UserRecord } from './user.schema';

export const UserMapper = {
  toDomain(record: UserRecord): User {
    return User.restore({
      id: record._id,
      email: Email.create(record.email),
      passwordHash: record.passwordHash,
      displayName: record.displayName,
      roles: record.roles,
      status: record.status,
      emailVerifiedAt: record.emailVerifiedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
    });
  },

  toRecord(user: User): UserRecord {
    const props = user.toProps();
    return {
      _id: props.id,
      email: props.email.value,
      passwordHash: props.passwordHash,
      displayName: props.displayName,
      roles: [...props.roles],
      status: props.status,
      emailVerifiedAt: props.emailVerifiedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      version: props.version,
    };
  },
};
