interface MongoServerErrorLike {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

/** True for E11000 duplicate key errors, optionally restricted to a specific indexed field. */
export function isDuplicateKeyError(error: unknown, field?: string): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as MongoServerErrorLike;
  if (candidate.code !== 11000) return false;
  return field === undefined || Boolean(candidate.keyPattern && field in candidate.keyPattern);
}
