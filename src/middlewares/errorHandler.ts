import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

function fromBodyParserError(err: unknown): AppError | null {
  if (typeof err !== 'object' || err === null || !('type' in err)) return null;

  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  }
  return null;
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const appError = err instanceof AppError ? err : fromBodyParserError(err);

  if (appError) {
    res.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
        requestId: req.id,
      },
    });
    return;
  }

  logger.error('Unhandled error', { requestId: req.id, error: err });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      details: [],
      requestId: req.id,
    },
  });
}
