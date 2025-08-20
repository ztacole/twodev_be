import { Router } from 'express';
import { AssesseeController } from './assessee.controller';

const router = Router();

router.post('/', AssesseeController.createAssesse);
router.get('/', AssesseeController.getAssesses);
router.get('/user/:userId', AssesseeController.getAssesseByUserId);
router.get('/:id', AssesseeController.getAssesseById);
router.put('/:id', AssesseeController.updateAssesse);
router.delete('/:id', AssesseeController.deleteAssesse);

export default router;