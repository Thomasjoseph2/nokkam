/**
 * Creates (or promotes) the platform administrator from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Admins are never self-registered through the API.
 *
 *   pnpm --filter @nokkam/api seed:admin
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PasswordHasher } from '../modules/auth/application/ports/password-hasher';
import { User } from '../modules/users/domain/user';
import { UserRepository } from '../modules/users/domain/user.repository';
import { Clock } from '../shared/application/clock';
import { IdGenerator } from '../shared/application/id-generator';
import { Email } from '../shared/domain/email';
import { UserRole } from '../shared/domain/user-role';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const rawEmail = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!rawEmail || !password || password.length < 12) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 12 characters)');
    }

    const users = app.get(UserRepository);
    const clock = app.get(Clock);
    const email = Email.create(rawEmail);
    const existing = await users.findByEmail(email);

    if (existing) {
      existing.grantRole(UserRole.ADMIN, clock.now());
      existing.verifyEmail(clock.now());
      await users.update(existing);
      process.stdout.write(`Granted ADMIN to existing user ${email.value}\n`);
      return;
    }

    const now = clock.now();
    const admin = User.register({
      id: app.get(IdGenerator).generate(),
      email,
      passwordHash: await app.get(PasswordHasher).hash(password),
      displayName: 'Platform Admin',
      role: UserRole.TESTER,
      now,
    });
    admin.grantRole(UserRole.ADMIN, now);
    admin.verifyEmail(now);
    await users.insert(admin);
    process.stdout.write(`Created admin ${email.value}\n`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
