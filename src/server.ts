import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const app = createApp();

const server = app.listen(env.PORT, (error?: Error) => {
  if (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
  logger.info(`Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals): void {
  if (isShuttingDown) return; // pressing Ctrl+C twice must not run this twice
  isShuttingDown = true;
  logger.info('Shutdown started', { signal });

  // Safety net: if something hangs, force the exit.
  // .unref() means this timer alone won't keep the process alive.
  setTimeout(() => {
    logger.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  // Stop accepting new connections. The callback runs once in-flight requests have finished.
  server.close((error) => {
    if (error) {
      logger.error('Error while closing HTTP server', { error });
      process.exit(1);
    }
    // Step 4: close the database pool here.
    logger.info('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

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
