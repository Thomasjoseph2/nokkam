import type { UserRole } from '../domain/user-role';

/** The authenticated principal performing a use case. Built from a verified access token. */
export interface Actor {
  userId: string;
  roles: readonly UserRole[];
  /** Refresh-token family the access token was issued for. */
  sessionId: string;
}

export function actorHasRole(actor: Actor, role: UserRole): boolean {
  return actor.roles.includes(role);
}

/** Request metadata that use cases may need for auditing / abuse prevention. */
export interface RequestMeta {
  requestId: string;
  ip: string | null;
  userAgent: string | null;
}
