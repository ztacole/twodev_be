import { Router } from 'express';
import { OccupationController } from './occupation.controller';

const router = Router();

router.post('/', OccupationController.createOccupation);
router.get('/', OccupationController.getOccupations);
router.get('/:id', OccupationController.getOccupationById);
router.put('/:id', OccupationController.updateOccupation);
router.delete('/:id', OccupationController.deleteOccupation);
router.get('/export/excel', OccupationController.exportOccupationsToExcel);

export default router;