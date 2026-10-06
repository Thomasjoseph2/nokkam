import type { UserRole } from '../../../../shared/domain/user-role';

export interface AccessTokenClaims {
  userId: string;
  sessionId: string;
  roles: UserRole[];
}

export interface IssuedAccessToken {
  token: string;
  expiresAt: Date;
}

export abstract class AccessTokenService {
  abstract issue(claims: AccessTokenClaims): IssuedAccessToken;
  /** Throws AccessTokenExpiredError or UnauthenticatedError. */
  abstract verify(token: string): AccessTokenClaims;
}
