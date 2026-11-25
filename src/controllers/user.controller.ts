import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { getAuthUser } from '../middlewares/authenticate.js';

export const userController = {
  async getMe(req: Request, res: Response): Promise<void> {
    const { id } = getAuthUser(req);
    const user = await userService.getById(id);
    res.status(200).json({ data: user });
  },
};
