import { Router } from 'express';
import { UserController } from './user.controller';
import { adminMiddleware, authenticateToken } from '../../middleware/auth.middleware';
import { requireApproval } from '../../middleware/approval.middleware';

const router = Router();

router.use(authenticateToken, adminMiddleware);

router.get('/', UserController.getUsers);
router.get('/:page/:limit', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', requireApproval('user'));
router.delete('/:id', requireApproval('user'));

export default router;
