/** Random, URL-safe secrets (refresh tokens, email links) and their keyed hashes for storage. */
export abstract class OpaqueTokenService {
  abstract generate(): string;
  abstract hash(token: string): string;
}
