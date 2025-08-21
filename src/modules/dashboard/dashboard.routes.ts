import { Router } from 'express';
import { DashboardController } from './admin/dashboard.controller';
import { DashboardAssessorController } from './assessor/assessor.controller';

const router = Router();

// admin
router.get('/admin/', DashboardController.getDashboardData);
router.get('/admin/summary', DashboardController.getSummary);
router.get('/admin/schedules', DashboardController.getSchedules);
router.get('/admin/verifications', DashboardController.getVerificationDocs);

// assessor
router.get('/assessor/:assessorId/mandiri', DashboardAssessorController.getAssessmentMandiriByAssessor);
router.get('/assessor/:assessorId/penilaian', DashboardAssessorController.getPenilaianByAssessor);

export default router;