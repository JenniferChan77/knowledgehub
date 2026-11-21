import type { Server } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool, checkDatabaseConnection } from './db/pool.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | undefined;
let isShuttingDown = false;

async function start(): Promise<void> {
  try {
    await checkDatabaseConnection();
  } catch (error) {
    logger.error('Cannot connect to the database', { error });
    process.exit(1);
  }
  logger.info('Connected to database');

  const app = createApp();
  server = app.listen(env.PORT, (error?: Error) => {
    if (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
    logger.info(`Server listening on http://localhost:${env.PORT}(${env.NODE_ENV})`);
  });
}

function closeServer(httpServer: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    httpServer.close((error) => (error ? reject(error) : resolve()));
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info('Shutdown started', { signal });

  setTimeout(() => {
    logger.error('Shutdonw timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  try {
    if (server) await closeServer(server);
    await pool.end();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', (signal) => void shutdown(signal));
process.on('SIGINT', (signal) => void shutdown(signal));

// Errors nothing caught. The app may now be in a broken state, so log and exit.
// In production, the platform restarts the process automatically.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

void start();
