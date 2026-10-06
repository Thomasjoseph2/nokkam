import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import type { ApiErrorDetail, ApiFailure } from '@nokkam/shared-types';
import { AppError, type ErrorKind } from '../../../domain/errors';
import type { AuthenticatedRequest } from '../request-context';

const STATUS_BY_KIND: Record<ErrorKind, number> = {
  VALIDATION: HttpStatus.UNPROCESSABLE_ENTITY,
  UNAUTHENTICATED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  RULE_VIOLATION: HttpStatus.UNPROCESSABLE_ENTITY,
};

const CODE_BY_STATUS: Record<number, string> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
};

/**
 * Single place where errors become HTTP responses.
 * - AppError (domain/application)  -> mapped by kind, code/message passed through
 * - Nest HttpException (routing, body parser, throttler) -> generic code by status
 * - anything else -> 500 with a generic message; details only in the server log
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<AuthenticatedRequest>();
    const requestId = req.id ? String(req.id) : undefined;

    const { status, body } = this.toResponse(exception);
    if (status >= 500) {
      this.logger.error({ err: exception, requestId }, 'Unhandled error');
    }

    const payload: ApiFailure = { error: { ...body, requestId } };
    res.status(status).json(payload);
  }

  private toResponse(exception: unknown): {
    status: number;
    body: { code: ApiFailure['error']['code']; message: string; details?: ApiErrorDetail[] };
  } {
    if (exception instanceof AppError) {
      return {
        status: STATUS_BY_KIND[exception.kind],
        body: {
          code: exception.code as ApiFailure['error']['code'],
          message: exception.message,
          details: exception.details,
        },
      };
    }

    if (exception instanceof ThrottlerException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        body: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down' },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = (CODE_BY_STATUS[status] ??
        (status >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_FAILED')) as ApiFailure['error']['code'];
      // Nest's own messages (e.g. "Cannot GET /x", "Unexpected token in JSON") are safe to expose.
      const message = status >= 500 ? 'Internal server error' : exception.message;
      return { status, body: { code, message } };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    };
  }
}
