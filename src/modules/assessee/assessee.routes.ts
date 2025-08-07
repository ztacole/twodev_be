import { Router } from 'express';
import { AssesseeController } from './assessee.controller';

const router = Router();
const controller = new AssesseeController();

router.post('/', controller.createAssesse.bind(controller));
router.get('/', controller.getAssesses.bind(controller));
router.get('/:id', controller.getAssesseById.bind(controller));
router.put('/:id', controller.updateAssesse.bind(controller));
router.delete('/:id', controller.deleteAssesse.bind(controller));

export default router;