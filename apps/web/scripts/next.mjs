// Runs `next <command>` on WEB_PORT from the monorepo-root .env (default 3000).
// PORT is reserved for the API, so the web app uses its own variable.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

const rootEnv = resolve(import.meta.dirname, '../../../.env');
if (existsSync(rootEnv)) {
  for (const [key, value] of Object.entries(parseEnv(readFileSync(rootEnv, 'utf8')))) {
    process.env[key] ??= value;
  }
}

const [command = 'dev', ...rest] = process.argv.slice(2);
const port = process.env.WEB_PORT ?? '3000';
const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, command, '--port', port, ...rest], {
  stdio: 'inherit',
});
child.on('exit', (code, signal) =>
  signal ? process.kill(process.pid, signal) : process.exit(code ?? 0),
);
