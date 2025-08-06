import { Router } from 'express';
import * as assesseController from './assessee.controller';

const router = Router();

router.post('/', assesseController.createAssesse);
router.get('/', assesseController.getAssesses);
router.get('/:id', assesseController.getAssesseById);
router.put('/:id', assesseController.updateAssesse);
router.delete('/:id', assesseController.deleteAssesse);

export default router;
