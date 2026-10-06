/**
 * Platform roles. A single account may hold several roles
 * (e.g. a business owner who also participates in campaigns as a tester).
 */
export const UserRole = {
  TESTER: 'TESTER',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const USER_ROLES = Object.values(UserRole);

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** Account types a person can choose at self-registration. ADMIN is never self-assignable. */
export const RegistrableAccountType = {
  TESTER: UserRole.TESTER,
  BUSINESS_OWNER: UserRole.BUSINESS_OWNER,
} as const;
export type RegistrableAccountType =
  (typeof RegistrableAccountType)[keyof typeof RegistrableAccountType];
