import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '../../../application/errors';
import type { UserRole } from '../../../domain/user-role';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../request-context';

/**
 * Coarse-grained RBAC: checks @Roles(...) metadata. Runs after the access-token guard.
 * Fine-grained, resource-level rules ("owns this business") live in application-layer
 * policies, because they need data the guard does not have.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { actor } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!actor || !required.some((role) => actor.roles.includes(role))) {
      throw new ForbiddenError();
    }
    return true;
  }
}
