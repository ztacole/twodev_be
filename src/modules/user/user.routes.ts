import { Router } from 'express';
import { getAllUsers } from './user.controller';

const router = Router();
router.get('/', getAllUsers);

export default router;
