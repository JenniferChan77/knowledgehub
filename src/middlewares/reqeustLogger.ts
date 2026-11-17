import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

const MAX_REQUEST_ID_LENGTH = 128;

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get('X-Request-Id');
  req.id = incoming && incoming.length <= MAX_REQUEST_ID_LENGTH ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);

  if (req.originalUrl.startsWith('/api/v1/health')) {
    next();
    return;
  }

  const start = performance.now();

  res.on('finish', () => {
    const meta = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(performance.now() - start),
    };

    if (res.statusCode >= 500) logger.error('request failed', meta);
    else if (res.statusCode >= 400) logger.warn('request rejected', meta);
    else logger.info('request completed', meta);
  });

  next();
}
