import { Router } from 'express';
import * as unitCompetencyController from './unit-competency.controller';

const router = Router();

router.post('/', unitCompetencyController.createUnitCompetency);
router.get('/', unitCompetencyController.getUnitCompetencies);
router.get('/:id', unitCompetencyController.getUnitCompetencyById);
router.put('/:id', unitCompetencyController.updateUnitCompetency);
router.delete('/:id', unitCompetencyController.deleteUnitCompetency);

export default router;