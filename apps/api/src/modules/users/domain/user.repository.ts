import type { Email } from '../../../shared/domain/email';
import type { User } from './user';

export interface UserPage {
  items: User[];
  nextCursor: string | null;
}

/**
 * Persistence port for the User aggregate. Implementations must:
 *  - reject duplicate emails on insert with EmailAlreadyRegisteredError
 *  - enforce optimistic concurrency on update (ConcurrentModificationError)
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract insert(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  /** Newest first, keyset-paginated. */
  abstract list(params: { limit: number; cursor?: string }): Promise<UserPage>;
}
