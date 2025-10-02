import { Router } from 'express';
import { authenticateToken, adminMiddleware } from '../../middleware/auth.middleware';
import { AdminController } from './admin.controller';

const router = Router();

router.use(authenticateToken, adminMiddleware);

router.get('/', AdminController.getAdmins);
router.get('/:id', AdminController.getAdminById);
router.post('/', AdminController.createAdmin);
router.put('/:id', AdminController.updateAdmin);
router.put('/profile/me', AdminController.updateMyProfile); // Token-based update
router.delete('/:id', AdminController.deleteAdmin);

export default router;
