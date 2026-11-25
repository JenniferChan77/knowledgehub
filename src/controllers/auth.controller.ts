import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { parseLoginInput, parseRegisterInput } from '../validators/auth.validator.js';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const input = parseRegisterInput(req.body);
    const result = await authService.register(input);
    res.status(201).json({ data: result });
  },

  async login(req: Request, res: Response): Promise<void> {
    const input = parseLoginInput(req.body);
    const result = await authService.login(input);
    res.status(200).json({ data: result });
  },
};
