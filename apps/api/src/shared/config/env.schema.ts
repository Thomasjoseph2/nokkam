import { z } from 'zod';

const csv = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const bool = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
    CORS_ORIGINS: csv.default(['http://localhost:3000']),
    COOKIE_SECURE: bool,
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
    EMAIL_TRANSPORT: z.enum(['log', 'smtp']).default('log'),
    EMAIL_FROM: z.string().default('Nokkam <no-reply@nokkam.local>'),
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().int().positive().default(1025),
    // true = implicit TLS (port 465). false = plain/STARTTLS (587 upgrades automatically, 1025 Mailpit).
    SMTP_SECURE: bool,
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    WEB_URL: z.url().default('http://localhost:3000'),
  })
  .superRefine((env, ctx) => {
    if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASSWORD)) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_PASSWORD'],
        message: 'Set both SMTP_USER and SMTP_PASSWORD, or neither',
      });
    }
    if (env.NODE_ENV === 'production') {
      if (!env.COOKIE_SECURE) {
        ctx.addIssue({
          code: 'custom',
          path: ['COOKIE_SECURE'],
          message: 'Must be true in production',
        });
      }
      for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
        if (env[key].startsWith('change-me')) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: 'Placeholder secret in production',
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return result.data;
}
