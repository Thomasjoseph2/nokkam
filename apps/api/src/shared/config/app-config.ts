import type { Env } from './env.schema';

/**
 * Typed, grouped, read-only view of the validated environment.
 * Inject `AppConfig` instead of reading process.env anywhere else.
 */
export class AppConfig {
  readonly env: Env['NODE_ENV'];
  readonly port: number;
  readonly mongoUri: string;
  readonly logLevel: Env['LOG_LEVEL'];
  readonly trustProxyHops: number;
  readonly webUrl: string;
  readonly cors: { origins: readonly string[] };
  readonly auth: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenTtlSeconds: number;
    refreshTokenTtlDays: number;
    cookieSecure: boolean;
  };
  readonly email: {
    transport: Env['EMAIL_TRANSPORT'];
    from: string;
    smtp: { host: string; port: number };
  };

  constructor(env: Env) {
    this.env = env.NODE_ENV;
    this.port = env.PORT;
    this.mongoUri = env.MONGODB_URI;
    this.logLevel = env.LOG_LEVEL;
    this.trustProxyHops = env.TRUST_PROXY_HOPS;
    this.webUrl = env.WEB_URL.replace(/\/$/, '');
    this.cors = { origins: env.CORS_ORIGINS };
    this.auth = {
      accessTokenSecret: env.JWT_ACCESS_SECRET,
      refreshTokenSecret: env.JWT_REFRESH_SECRET,
      accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
      cookieSecure: env.COOKIE_SECURE,
    };
    this.email = {
      transport: env.EMAIL_TRANSPORT,
      from: env.EMAIL_FROM,
      smtp: { host: env.SMTP_HOST, port: env.SMTP_PORT },
    };
    Object.freeze(this);
  }

  get isProduction(): boolean {
    return this.env === 'production';
  }
}
