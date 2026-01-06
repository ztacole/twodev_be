import { Router } from 'express';
import { authenticateToken, adminMiddleware } from '../../middleware/auth.middleware';
import { AdminController } from './admin.controller';
import { uploadAdminSignature } from './upload-config';

const router = Router();

router.use(authenticateToken, adminMiddleware);

router.get('/', AdminController.getAdmins);
router.get('/:id', AdminController.getAdminById);
router.post('/', uploadAdminSignature, AdminController.createAdmin);
router.put('/:id', AdminController.updateAdmin);
router.put('/profile/me', uploadAdminSignature, AdminController.updateMyProfile);
router.delete('/:id', AdminController.deleteAdmin);

export default router;
