import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from '../../shared/config/app-config';
import { RolesGuard } from '../../shared/presentation/http/guards/roles.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AuthSettings } from './application/auth-settings';
import { EmailVerificationSender } from './application/email-verification-sender';
import { LoginUserUseCase } from './application/login-user.use-case';
import { LogoutUseCase } from './application/logout.use-case';
import { AccessTokenService } from './application/ports/access-token-service';
import { AuthEmails } from './application/ports/auth-emails';
import { OpaqueTokenService } from './application/ports/opaque-token-service';
import { PasswordHasher } from './application/ports/password-hasher';
import { RefreshSessionUseCase } from './application/refresh-session.use-case';
import { RegisterUserUseCase } from './application/register-user.use-case';
import { ResendVerificationEmailUseCase } from './application/resend-verification-email.use-case';
import { SessionIssuer } from './application/session-issuer';
import { VerifyEmailUseCase } from './application/verify-email.use-case';
import { AccountTokenRepository } from './domain/account-token.repository';
import { RefreshSessionRepository } from './domain/refresh-session.repository';
import { ACCOUNT_TOKEN_MODEL, AccountTokenSchema } from './infrastructure/account-token.schema';
import { Argon2PasswordHasher } from './infrastructure/argon2-password-hasher';
import { EmailAuthEmails } from './infrastructure/email-auth-emails';
import { HmacOpaqueTokenService } from './infrastructure/hmac-opaque-token.service';
import { JwtAccessTokenService } from './infrastructure/jwt-access-token.service';
import { MongoAccountTokenRepository } from './infrastructure/mongo-account-token.repository';
import { MongoRefreshSessionRepository } from './infrastructure/mongo-refresh-session.repository';
import {
  REFRESH_SESSION_MODEL,
  RefreshSessionSchema,
} from './infrastructure/refresh-session.schema';
import { AccessTokenGuard } from './presentation/access-token.guard';
import { AuthCookies } from './presentation/auth-cookies';
import { AuthController } from './presentation/auth.controller';

const DAY_MS = 24 * 60 * 60 * 1000;

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: REFRESH_SESSION_MODEL, schema: RefreshSessionSchema },
      { name: ACCOUNT_TOKEN_MODEL, schema: AccountTokenSchema },
    ]),
    JwtModule.registerAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        secret: config.auth.accessTokenSecret,
        signOptions: { algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // use cases & application services
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
    SessionIssuer,
    EmailVerificationSender,
    {
      provide: AuthSettings,
      inject: [AppConfig],
      useFactory: (config: AppConfig): AuthSettings => ({
        refreshTokenTtlMs: config.auth.refreshTokenTtlDays * DAY_MS,
        refreshReuseGraceMs: 30_000,
        emailVerificationTtlMs: 2 * DAY_MS,
      }),
    },
    // ports -> adapters
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: AccessTokenService, useClass: JwtAccessTokenService },
    { provide: OpaqueTokenService, useClass: HmacOpaqueTokenService },
    { provide: AuthEmails, useClass: EmailAuthEmails },
    { provide: RefreshSessionRepository, useClass: MongoRefreshSessionRepository },
    { provide: AccountTokenRepository, useClass: MongoAccountTokenRepository },
    // presentation
    AuthCookies,
    // Global guards run in registration order: authenticate, then authorise.
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [PasswordHasher],
})
export class AuthModule {}
