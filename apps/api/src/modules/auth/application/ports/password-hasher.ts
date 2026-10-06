export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract verify(hash: string, plain: string): Promise<boolean>;
  /** Burns comparable CPU when the user does not exist, to avoid leaking account existence via timing. */
  abstract verifyAgainstDummy(plain: string): Promise<void>;
}
