import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../../domain/user-role';

export const ROLES_KEY = 'auth:roles';

/** Restricts a route to actors holding at least one of the given roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
