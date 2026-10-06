/** Tunables for auth flows, provided from configuration. */
export abstract class AuthSettings {
  abstract readonly refreshTokenTtlMs: number;
  /** Window in which a just-rotated refresh token is still accepted (parallel requests/tabs). */
  abstract readonly refreshReuseGraceMs: number;
  abstract readonly emailVerificationTtlMs: number;
}
