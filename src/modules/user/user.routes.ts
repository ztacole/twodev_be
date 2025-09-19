import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();

router.get('/', UserController.getUsers);
router.get('/:page/:limit', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
