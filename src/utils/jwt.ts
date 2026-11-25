import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/AppError.js';

const ALGORITHM = 'HS256';

export function signAccessToken(userId: number): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  });
}

export function verifyAccessToken(token: string): number {
  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Access token is invalid', 'INVALID_TOKEN');
  }

  const userId = typeof payload === 'string' ? NaN : Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new UnauthorizedError('Access token is invalid', 'INVALID_TOKEN');
  }
  return userId;
}
