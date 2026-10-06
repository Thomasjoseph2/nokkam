import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { IdGenerator } from '../application/id-generator';

/**
 * RFC 9562 UUIDv7: 48-bit millisecond timestamp + random bits.
 * Time-ordered, so it keeps B-tree index inserts append-mostly (unlike UUIDv4)
 * while remaining non-enumerable and free of database coupling.
 */
export function uuidv7(now: number = Date.now()): string {
  const bytes = randomBytes(16);
  bytes.writeUIntBE(now, 0, 6);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // RFC 4122 variant
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

@Injectable()
export class UuidV7Generator extends IdGenerator {
  generate(): string {
    return uuidv7();
  }
}
