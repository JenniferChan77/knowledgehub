import { NotFoundError } from '../errors/AppError.js';
import { userRepository } from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser } from '../types/user.js';

export const userService = {
  async getById(id: number): Promise<PublicUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    return toPublicUser(user);
  },
};
