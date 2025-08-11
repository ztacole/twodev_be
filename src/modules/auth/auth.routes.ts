import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.get('/me', AuthController.me);

export default router; 