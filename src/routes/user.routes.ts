import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

export const userRouter = Router();

userRouter.get('/me', authenticate, userController.getMe);
