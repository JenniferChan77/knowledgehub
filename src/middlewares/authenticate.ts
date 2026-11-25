import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

const BEARER_PREFIX = 'Bearer ';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('Authorization');
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError('Missing bearer token', 'MISSING_TOKEN');
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (verifyAccessToken(token)) {
    req.user = { id: verifyAccessToken(token) };
  }
  next();
}

// For controllers on routes that use 'authenticate'
export function getAuthUser(req: Request): { id: number } {
  if (!req.user) {
    // Only possible if a route forgot `authenticate`: that's OUR bug, so a plain Error (500).
    throw new Error('getAuthUser() called on a route without the authenticate middleware');
  }
  return req.user;
}
