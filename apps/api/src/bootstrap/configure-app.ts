import { type INestApplication, VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppConfig } from '../shared/config/app-config';

/**
 * HTTP pipeline shared by main.ts and the e2e tests, so tests exercise the real setup.
 * Routes are served under /api/v1/...
 */
export function configureApp(app: INestApplication): void {
  const express = app as NestExpressApplication;
  const config = app.get(AppConfig);

  app.useLogger(app.get(Logger));
  express.set('trust proxy', config.trustProxyHops);
  express.disable('x-powered-by');

  app.use(helmet());
  app.use(cookieParser());
  express.useBodyParser('json', { limit: '100kb' });
  app.enableCors({
    origin: [...config.cors.origins],
    credentials: true,
    exposedHeaders: ['X-Request-Id'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();
}
