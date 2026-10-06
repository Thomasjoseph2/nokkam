import type { AccountToken, AccountTokenPurpose } from './account-token';

export abstract class AccountTokenRepository {
  abstract insert(token: AccountToken): Promise<void>;
  abstract findByHash(
    tokenHash: string,
    purpose: AccountTokenPurpose,
  ): Promise<AccountToken | null>;
  /** Atomically consumes the token; false if it was already consumed. */
  abstract consume(id: string, now: Date): Promise<boolean>;
  /** Removes outstanding tokens (e.g. before re-sending a verification email). */
  abstract deleteOutstanding(userId: string, purpose: AccountTokenPurpose): Promise<void>;
}
