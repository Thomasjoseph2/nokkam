import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { AppConfigModule } from './shared/config/config.module';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';
import { LoggingModule } from './shared/logging/logging.module';
import { AllExceptionsFilter } from './shared/presentation/http/filters/all-exceptions.filter';
import { OriginCheckMiddleware } from './shared/presentation/http/middleware/origin-check.middleware';
import { ResponseEnvelopeInterceptor } from './shared/presentation/http/interceptors/response-envelope.interceptor';

@Module({
  imports: [
    // foundation
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    SharedInfrastructureModule,
    // Global per-IP limit; sensitive routes tighten it with @Throttle().
    // In-memory storage is per-instance: switch to a Redis store when running >1 replica.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    // feature modules
    HealthModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Registered after LoggingModule's middleware, so rejected requests still get a request id.
    consumer.apply(OriginCheckMiddleware).forRoutes('*path');
  }
}
