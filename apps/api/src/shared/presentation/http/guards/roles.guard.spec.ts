import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '../../../application/errors';
import { UserRole } from '../../../domain/user-role';
import { RolesGuard } from './roles.guard';

function contextFor(required: UserRole[] | undefined, actorRoles?: UserRole[]) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(required);
  const request = actorRoles ? { actor: { userId: 'u', sessionId: 's', roles: actorRoles } } : {};
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { guard: new RolesGuard(reflector), context };
}

describe('RolesGuard', () => {
  it('allows routes without role requirements', () => {
    const { guard, context } = contextFor(undefined, [UserRole.TESTER]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows an actor holding any required role', () => {
    const { guard, context } = contextFor(
      [UserRole.ADMIN, UserRole.BUSINESS_OWNER],
      [UserRole.BUSINESS_OWNER],
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('forbids an actor lacking the required role', () => {
    const { guard, context } = contextFor(
      [UserRole.ADMIN],
      [UserRole.TESTER, UserRole.BUSINESS_OWNER],
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });

  it('forbids when no actor is present', () => {
    const { guard, context } = contextFor([UserRole.ADMIN]);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });
});
