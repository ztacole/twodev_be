import { Router } from 'express';
import { DashboardController } from './admin/dashboard.controller';
import { DashboardAssessorController } from './assessor/assessor.controller';
import { adminMiddleware, assessorMiddleware, authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// admin
router.get('/admin/', authenticateToken, adminMiddleware, DashboardController.getDashboardData);
router.get('/admin/summary', authenticateToken, adminMiddleware, DashboardController.getSummary);
router.get('/admin/schedules', authenticateToken, adminMiddleware, DashboardController.getSchedules);
router.get('/admin/verifications', authenticateToken, adminMiddleware, DashboardController.getVerificationDocs);

// assessor
router.get('/assessor/:assessorId/:scheduleId/:type', authenticateToken, assessorMiddleware, DashboardAssessorController.getAPL02Assessee);

export default router;