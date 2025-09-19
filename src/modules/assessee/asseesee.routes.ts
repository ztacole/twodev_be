import { Router } from 'express';
import { AssesseeController } from './asseesee.controller';

const router = Router();

router.post('/', AssesseeController.createAssessee);
router.get('/', AssesseeController.getAssessees);
router.get('/:page/:limit', AssesseeController.getAssessees);
router.get('/:id', AssesseeController.getAssesseeById);
router.put('/:id', AssesseeController.updateAssessee);
router.delete('/:id', AssesseeController.deleteAssessee);

export default router;
