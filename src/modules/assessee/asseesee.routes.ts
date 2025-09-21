import { Router } from 'express';
import { AssesseeController } from './asseesee.controller';
import { adminMiddleware, authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, adminMiddleware);

router.post('/', AssesseeController.createAssessee);
router.get('/', AssesseeController.getAssessees);
router.get('/:id', AssesseeController.getAssesseeById);
router.put('/:id', AssesseeController.updateAssessee);
router.delete('/:id', AssesseeController.deleteAssessee);

export default router;
