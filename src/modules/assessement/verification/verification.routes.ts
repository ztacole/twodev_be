import { Router } from 'express';
import * as verificationController from './verification.controller';
import { adminMiddleware, authenticateToken } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, adminMiddleware);

// admin-only endpoints (router mounted under /api/assessments)
router.get('/verification/pending', authenticateToken, verificationController.getPending);
router.get('/verification/pending/:scheduleDetailId', authenticateToken, verificationController.getPending);
router.get('/verification/approved', authenticateToken, verificationController.getApproved);
router.get('/verification/approved/:scheduleDetailId', authenticateToken, verificationController.getApproved);

router.get('/verification/schedule-detail/:scheduleDetailId', authenticateToken, verificationController.getByScheduleDetail);
router.post('/verification/schedule-detail/:scheduleDetailId/approve', authenticateToken, verificationController.approveByScheduleDetail);

router.get('/verification/result/:resultId', authenticateToken, verificationController.getDetail);
router.post('/verification/:resultId/approve', authenticateToken, verificationController.approve);

export default router;
