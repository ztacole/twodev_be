import { Router } from 'express';
import { SchemeController } from './scheme.controller';
import { adminMiddleware, adminOrAssessorMiddleware, authenticateToken } from '../../middleware/auth.middleware';
import { requireApproval } from '../../middleware/approval.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', authenticateToken, adminMiddleware, SchemeController.createScheme);
router.get('/', authenticateToken, adminOrAssessorMiddleware, SchemeController.getSchemes);
router.get('/:id', authenticateToken, adminOrAssessorMiddleware, SchemeController.getSchemeById);
router.put('/:id', authenticateToken, adminMiddleware, requireApproval('scheme'), SchemeController.updateScheme);
router.delete('/:id', authenticateToken, adminMiddleware, requireApproval('scheme'), SchemeController.deleteScheme);
router.get('/export/excel', authenticateToken, adminMiddleware, SchemeController.exportSchemesToExcel);

export default router;
