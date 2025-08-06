import { Router } from 'express';
import * as assessementController from './assessement.controller';

const router = Router();

router.post('/', assessementController.createAssessement);
router.get('/', assessementController.getAssessements);
router.get('/:id', assessementController.getAssessementById);
router.put('/:id', assessementController.updateAssessement);
router.delete('/:id', assessementController.deleteAssessement);

export default router;
