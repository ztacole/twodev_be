import { Router } from 'express';
import { AssessorController } from './assessor.controller';
import { uploadAssessorDetail } from './upload-config';
import {  createUploader } from '../../helper/upload.helper';
import { adminOrAssessorMiddleware, authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, adminOrAssessorMiddleware);

router.post('/', uploadAssessorDetail, AssessorController.createAssessor);
router.get('/', AssessorController.getAssessors);
router.get('/user/status', AssessorController.getAssessorUsers);
router.get('/user/:userId', AssessorController.getAssessorByUserId);
router.get('/:id', AssessorController.getAssessorById);
router.delete('/:id', AssessorController.deleteAssessor);

router.get('/:assessorId/detail', AssessorController.getAssessorDetail);
router.get('/detail/all', AssessorController.getAllAssessorDetails);

export default router;