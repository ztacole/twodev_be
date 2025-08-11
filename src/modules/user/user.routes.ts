import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, createAssessorUser, createAssesseeUser } from './user.controller';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/assessor', createAssessorUser);
router.post('/assessee', createAssesseeUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
