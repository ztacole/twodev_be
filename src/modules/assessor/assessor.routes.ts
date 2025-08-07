import { Router } from 'express';
import * as assessorController from './assessor.controller';

const router = Router();

router.post('/', assessorController.createAssessor);
router.get('/', assessorController.getAssessors);
router.get('/:id', assessorController.getAssessorById);
router.put('/:id', assessorController.updateAssessor);
router.delete('/:id', assessorController.deleteAssessor);

export default router;
