import type { UserRole, UserStatus } from './roles';

/** Admin-facing summary of an account. */
export interface AdminUserSummaryDto {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
}
