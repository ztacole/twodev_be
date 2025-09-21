import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.get('/me', authenticateToken, AuthController.me);

export default router; 