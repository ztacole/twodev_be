import { Router } from 'express';
import * as occupationController from './occupation.controller';

const router = Router();

router.post('/', occupationController.createOccupation);
router.get('/', occupationController.getOccupations);
router.get('/:id', occupationController.getOccupationById);
router.put('/:id', occupationController.updateOccupation);
router.delete('/:id', occupationController.deleteOccupation);

export default router;