import { Router } from 'express';
import { authenticateToken, adminMiddleware } from '../../middleware/auth.middleware';
import { AdminController } from './admin.controller';

const router = Router();

router.use(authenticateToken, adminMiddleware);

router.get('/', AdminController.getAdmins);
router.get('/:id', AdminController.getAdminById);
router.post('/', AdminController.createAdmin);

export default router;
