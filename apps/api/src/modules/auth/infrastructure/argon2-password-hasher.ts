import { Injectable } from '@nestjs/common';
import { Algorithm, hash, verify } from '@node-rs/argon2';
import { PasswordHasher } from '../application/ports/password-hasher';

// OWASP Password Storage Cheat Sheet baseline for Argon2id.
const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  private dummyHash: Promise<string> | undefined;

  hash(plain: string): Promise<string> {
    return hash(plain, OPTIONS);
  }

  async verify(hashed: string, plain: string): Promise<boolean> {
    try {
      return await verify(hashed, plain);
    } catch {
      return false; // malformed hash
    }
  }

  async verifyAgainstDummy(plain: string): Promise<void> {
    this.dummyHash ??= hash('dummy-password-for-timing-equalisation', OPTIONS);
    await this.verify(await this.dummyHash, plain);
  }
}
