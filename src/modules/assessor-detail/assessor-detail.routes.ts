import { Router } from 'express';
import { AssessorDetailController } from './assessor-detail.controller';
import { adminOrAssessorMiddleware, authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, adminOrAssessorMiddleware);

router.get('/:assessorId', AssessorDetailController.getByAssessorId);
router.post('/:assessorId', AssessorDetailController.upsertByAssessorId);

export default router;
