import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
  logger.error('Unexpected error on an idle database connection', { error });
});

export async function checkDatabaseConnection(): Promise<void> {
  await pool.query('SELECT 1');
}
