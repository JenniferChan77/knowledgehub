import { readdir, readFile } from 'node:fs/promises';
import { pool } from './pool.js';
import { logger } from '../utils/logger.js';

const MIGRATION_DIR = new URL('../../migrations/', import.meta.url);

async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.name));
  const files = (await readdir(MIGRATION_DIR)).filter((file) => file.endsWith('.sql')).sort();
  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    logger.info('Database is up to date');
    return;
  }

  for (const file of pending) {
    const sql = await readFile(new URL(file, MIGRATION_DIR), 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      logger.info(`Applied migration ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Migration ${file} failed, rolled back`, { error });
      throw error;
    } finally {
      client.release();
    }
  }
}

try {
  await migrate();
} catch (error) {
  logger.error('Migration failed', { error });
  process.exitCode = 1;
} finally {
  await pool.end();
}
