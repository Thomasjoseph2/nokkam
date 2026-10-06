/**
 * Roles are part of the shared kernel because authorization is cross-cutting:
 * every module needs to reason about "who is acting". The wire contract in
 * @nokkam/shared-types mirrors these values (checked at compile time in the users presenter).
 */
export const UserRole = {
  TESTER: 'TESTER',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const USER_ROLES: readonly UserRole[] = Object.values(UserRole);
