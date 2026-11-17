import express, { type Express } from 'express';
import { requestLogger } from './middlewares/reqeustLogger.js';
import { notFound } from './middlewares/notFound.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(requestLogger);
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
