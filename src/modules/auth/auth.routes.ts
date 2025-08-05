import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));

router.post('/login', authController.login.bind(authController));

router.get('/me', authController.me.bind(authController));

export default router; 