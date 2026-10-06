import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

/** Return this from a controller to include `meta` (e.g. pagination) next to `data`. */
export class Envelope<T, M> {
  constructor(
    readonly data: T,
    readonly meta: M,
  ) {}
}

/**
 * Wraps controller results in the standard `{ data }` envelope.
 * `undefined` results (204 No Content handlers) are passed through untouched.
 */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        if (result === undefined) return undefined;
        if (result instanceof Envelope) return { data: result.data, meta: result.meta };
        return { data: result };
      }),
    );
  }
}
