import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import { AppConfig } from '../config/app-config';

export const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

/**
 * Structured JSON logging (pino) with a request id on every log line.
 * An incoming X-Request-Id is honoured when well-formed (so ids propagate across
 * services / the Next.js server), otherwise one is generated. The id is echoed back
 * in the response header and in error bodies.
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        pinoHttp: {
          level: config.logLevel,
          genReqId: (req: IncomingMessage, res: ServerResponse) => {
            const incoming = req.headers[REQUEST_ID_HEADER];
            const id =
              typeof incoming === 'string' && REQUEST_ID_PATTERN.test(incoming)
                ? incoming
                : randomUUID();
            res.setHeader('X-Request-Id', id);
            return id;
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              '*.password',
              '*.token',
              '*.refreshToken',
            ],
            censor: '[redacted]',
          },
          serializers: {
            req: (req: { id: string; method: string; url: string }) => ({
              id: req.id,
              method: req.method,
              url: req.url,
            }),
            // Status only: response headers (CSP, rate-limit, etc.) are noise in every log line.
            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
          },
          autoLogging: {
            ignore: (req: IncomingMessage) => req.url?.endsWith('/health') ?? false,
          },
          customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
            if (err || res.statusCode >= 500) return 'error';
            if (res.statusCode >= 400) return 'warn';
            return 'info';
          },
          transport:
            config.env === 'development'
              ? {
                  target: 'pino-pretty',
                  options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' },
                }
              : undefined,
        },
      }),
    }),
  ],
})
export class LoggingModule {}
