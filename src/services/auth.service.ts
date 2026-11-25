import { randomUUID } from 'node:crypto';
import { ConflictError, UnauthorizedError } from '../errors/AppError.js';
import { isUniqueViolation } from '../errors/pgErrors.js';
import { userRepository } from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser } from '../types/user.js';
import { signAccessToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export interface AuthResult {
  user: PublicUser;
  accessToken?: string;
}

// The unique index from migration 001.
const EMAIL_UNIQUE_INDEX = 'users_email_lower_key';

// A real bcrypt hash of a random value. Login compares against it when the email doesn't
// exist, so "unknown email" and "wrong password" take the same time
const DUMMY_PASSWORD_HASH = await hashPassword(randomUUID());

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const passwordHash = await hashPassword(input.password);
    try {
      const user = await userRepository.create({
        email: input.email,
        name: input.name,
        passwordHash,
      });
      const publicUser = toPublicUser(user);
      return { user: publicUser };
    } catch (error) {
      if (isUniqueViolation(error, EMAIL_UNIQUE_INDEX))
        throw new ConflictError('This email is already registered', 'EMAIL_TAKEN');
      throw error;
    }
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    const hashedPassword = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
    const isCorrectPassword = await verifyPassword(input.password, hashedPassword);

    if (!user || !isCorrectPassword) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    return { user: toPublicUser(user), accessToken: signAccessToken(user.id) };
  },
};
