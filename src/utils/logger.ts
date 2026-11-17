import { env } from '../config/env.js';

type Level = 'debug' | 'info' | 'warn' | 'error';
type Meta = Record<string, unknown>;

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const MIN_LEVEL: Level = env.NODE_ENV === 'development' ? 'debug' : 'info';

function errorReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function write(level: Level, message: string, meta?: Meta): void {
  if (env.NODE_ENV === 'test') return; // keep test output clean
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;

  let line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}`;
  if (meta) line += ` ${JSON.stringify(meta, errorReplacer)}`;

  if (level === 'warn' || level === 'error') console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, meta?: Meta) => write('debug', message, meta),
  info: (message: string, meta?: Meta) => write('info', message, meta),
  warn: (message: string, meta?: Meta) => write('warn', message, meta),
  error: (message: string, meta?: Meta) => write('error', message, meta),
};
