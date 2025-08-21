import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();

router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.post('/assessor', UserController.createAssessorUser);
router.post('/assessee', UserController.createAssesseeUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
