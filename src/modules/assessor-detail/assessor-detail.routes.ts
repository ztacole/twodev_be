import { Router } from 'express';
import { AssessorDetailController } from './assessor-detail.controller';

const router = Router();

router.get('/:assessorId', AssessorDetailController.getByAssessorId);
router.post('/:assessorId', AssessorDetailController.upsertByAssessorId);

export default router;
