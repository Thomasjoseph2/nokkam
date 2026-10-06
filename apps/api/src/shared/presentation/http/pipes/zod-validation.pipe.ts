import { type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { InvalidValueError } from '../../../domain/errors';

/**
 * Validates and parses a request part against a Zod schema (usually one exported by
 * @nokkam/shared-types so web and api share the exact same rules).
 *
 *   @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest
 */
export class ZodValidationPipe<S extends z.ZodType> implements PipeTransform<unknown, z.infer<S>> {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.infer<S> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    throw new InvalidValueError(
      'Request validation failed',
      result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || undefined,
        message: issue.message,
      })),
    );
  }
}
