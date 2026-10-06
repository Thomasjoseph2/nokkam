import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

/** apps/api (works from both src/ and dist/, which sit at the same depth). */
const API_ROOT = join(__dirname, '../../..');
const REPO_ROOT = join(API_ROOT, '../..');

/**
 * Loads `.env` files into process.env without overriding variables that are already set.
 * Precedence: real environment > apps/api/.env > <repo root>/.env.
 */
export function loadEnvFiles(files = [join(API_ROOT, '.env'), join(REPO_ROOT, '.env')]): void {
  for (const file of files) {
    if (!existsSync(file)) continue;
    const parsed = parseEnv(readFileSync(file, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
