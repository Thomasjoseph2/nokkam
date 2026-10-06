import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap/configure-app';
import {
  AuthEmails,
  type VerificationEmailInput,
} from '../../src/modules/auth/application/ports/auth-emails';
import { uniqueDatabaseUri } from './test-db';

export const WEB_ORIGIN = 'http://localhost:3000';

/** Captures outbound auth emails so tests can follow verification links. */
export class CapturingAuthEmails extends AuthEmails {
  readonly sent: VerificationEmailInput[] = [];
  async sendEmailVerification(input: VerificationEmailInput): Promise<void> {
    this.sent.push(input);
  }
  lastTokenFor(email: string): string | undefined {
    return this.sent.filter((mail) => mail.to === email).at(-1)?.rawToken;
  }
}

export interface TestApp {
  app: INestApplication;
  emails: CapturingAuthEmails;
  close(): Promise<void>;
}

/** Boots the real AppModule + HTTP pipeline against a fresh database. */
export async function createTestApp(): Promise<TestApp> {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    MONGODB_URI: uniqueDatabaseUri(),
    JWT_ACCESS_SECRET: 'test-access-secret-test-access-secret-0001',
    JWT_REFRESH_SECRET: 'test-refresh-secret-test-refresh-secret-01',
    CORS_ORIGINS: WEB_ORIGIN,
    COOKIE_SECURE: 'false',
    LOG_LEVEL: 'silent',
    EMAIL_TRANSPORT: 'log',
  });

  const emails = new CapturingAuthEmails();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(AuthEmails)
    .useValue(emails)
    .compile();

  const app = moduleRef.createNestApplication({ bodyParser: false });
  configureApp(app);
  await app.init();
  // Unique indexes must exist before tests rely on them.
  const connection = app.get<Connection>(getConnectionToken());
  await Promise.all(Object.values(connection.models).map((model) => model.syncIndexes()));

  return {
    app,
    emails,
    async close() {
      await connection.dropDatabase();
      await app.close();
    },
  };
}
