import { Router } from 'express';
import * as verificationController from './verification.controller';
import { authenticateToken } from '../../../middleware/auth.middleware';

const router = Router();

// admin-only endpoints (router mounted under /api/assessments)
router.get('/verification/pending', authenticateToken, verificationController.getPending);
router.get('/verification/pending/:scheduleDetailId', authenticateToken, verificationController.getPending);
router.get('/verification/approved', authenticateToken, verificationController.getApproved);
router.get('/verification/approved/:scheduleDetailId', authenticateToken, verificationController.getApproved);
router.get('/verification/:resultId', authenticateToken, verificationController.getDetail);
router.get('/verification/:scheduleDetailId', authenticateToken, verificationController.getByScheduleDetail);
router.post('/verification/:resultId/approve', authenticateToken, verificationController.approve);
router.post('/verification/:scheduleDetailId/approve', authenticateToken, verificationController.approveByScheduleDetail);

export default router;
