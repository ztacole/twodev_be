import { Router } from 'express';
import { adminMiddleware, authenticateToken } from '../../middleware/auth.middleware';
import { RoleController } from './role.controller';

const router = Router();

router.use(authenticateToken, adminMiddleware);

router.get('/', RoleController.getRoles);

export default router;