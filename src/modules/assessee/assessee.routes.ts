import { Router } from 'express';
import { AssesseeController } from './assessee.controller';

const router = Router();
const controller = new AssesseeController();

router.get('/', controller.getAllWithJobs.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router; 