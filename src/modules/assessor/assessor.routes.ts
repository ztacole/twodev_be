import { Router } from 'express';
import { AssessorController } from './assessor.controller';
import { uploadAssessorDetail } from './upload-config';

const router = Router();

router.post('/', AssessorController.createAssessor);
router.get('/', AssessorController.getAssessors);
router.get('/user/:userId', AssessorController.getAssessorByUserId);
router.get('/:id', AssessorController.getAssessorById);
router.put('/:id', AssessorController.updateAssessor);
router.delete('/:id', AssessorController.deleteAssessor);

router.post('/uploads', uploadAssessorDetail, AssessorController.createOrUpdateAssessorDetail);
router.get('/:assessorId/detail', AssessorController.getAssessorDetail);
router.get('/detail/all', AssessorController.getAllAssessorDetails);

export default router;