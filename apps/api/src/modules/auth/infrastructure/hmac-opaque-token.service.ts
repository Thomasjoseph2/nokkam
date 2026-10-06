import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import { AppConfig } from '../../../shared/config/app-config';
import { OpaqueTokenService } from '../application/ports/opaque-token-service';

/**
 * 256-bit random tokens; stored as HMAC-SHA256 keyed with JWT_REFRESH_SECRET.
 * A database leak alone therefore does not let anyone forge or look up valid tokens.
 */
@Injectable()
export class HmacOpaqueTokenService extends OpaqueTokenService {
  private readonly key: string;

  constructor(config: AppConfig) {
    super();
    this.key = config.auth.refreshTokenSecret;
  }

  generate(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(token: string): string {
    return createHmac('sha256', this.key).update(token).digest('hex');
  }
}
