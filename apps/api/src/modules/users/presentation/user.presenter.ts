import type {
  AdminUserSummaryDto,
  CurrentUserDto,
  UserRole as ContractUserRole,
  UserStatus as ContractUserStatus,
} from '@nokkam/shared-types';
import type { UserRole } from '../../../shared/domain/user-role';
import type { User } from '../domain/user';
import type { UserStatus } from '../domain/user-status';

// Compile-time guard: domain enums and the public contract must stay identical.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const _rolesMatch: Same<UserRole, ContractUserRole> = true;
const _statusMatch: Same<UserStatus, ContractUserStatus> = true;
void _rolesMatch;
void _statusMatch;

export const UserPresenter = {
  toCurrentUser(user: User): CurrentUserDto {
    return {
      id: user.id,
      email: user.email.value,
      displayName: user.displayName,
      roles: [...user.roles],
      status: user.status,
      emailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  },

  toAdminSummary(user: User): AdminUserSummaryDto {
    return {
      id: user.id,
      email: user.email.value,
      displayName: user.displayName,
      roles: [...user.roles],
      status: user.status,
      emailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  },
};
