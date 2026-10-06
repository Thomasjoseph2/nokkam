import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap/configure-app';
import { AppConfig } from './shared/config/app-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false, // configured explicitly (size limits) in configureApp
  });
  configureApp(app);

  const config = app.get(AppConfig);
  await app.listen(config.port);
  app.get(Logger).log(`API listening on http://localhost:${config.port}/api/v1`, 'Bootstrap');
}

void bootstrap();
