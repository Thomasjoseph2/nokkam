import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { UnauthenticatedError } from '../../../application/errors';
import { type AuthenticatedRequest, requestMetaFrom } from '../request-context';

/** Injects the authenticated Actor. Throws if used on a route where no actor was resolved. */
export const CurrentActor = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!req.actor) throw new UnauthenticatedError();
  return req.actor;
});

/** Injects the Actor when present (for @Public routes that personalise for signed-in users). */
export const OptionalActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().actor ?? null,
);

/** Injects RequestMeta (request id, ip, user agent) for auditing. */
export const ReqMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext) =>
  requestMetaFrom(ctx.switchToHttp().getRequest<AuthenticatedRequest>()),
);
