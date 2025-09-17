import { Router } from "express";
import { adminMiddleware, adminOrAssessorMiddleware, assessorMiddleware, authUpload } from '../../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';
import { upload as uploadCertificate } from "./apl-01/upload-config";
import { uploadIA02 } from "./ia-02/upload-conifg";
import { APL02Controller } from "./apl-02/apl-02.controller";
import { APL1Controller } from "./apl-01/apl-01.controller";
import { IA01Controller } from "./ia-01/ia-01.controller";
import { IA02Controller } from "./ia-02/ia-02.controller";
import { IA03Controller } from "./ia-03/ia-03.controller";
import { IA05Controller } from "./ia-05/ia-05.controller";
import { AssessmentController } from "./assessment.controller";
import { AK01Controller } from "./ak-01/ak-01.controller";
import { AK02Controller } from "./ak-02/ak-02.controller";
import { AK03Controller } from "./ak-03/ak-03.controller";
import { AK04Controller } from "./ak-04/ak-04.controller";
import { AK05Controller } from "./ak-05/ak-05.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/create', AssessmentController.createAssessment);
router.get('/', AssessmentController.getAssessments);
router.get('/:id', AssessmentController.getAssessmentById);
router.delete('/:id', AssessmentController.deleteAssessment);
router.get('/result/:assessmentId/:assessorId/:assesseeId', AssessmentController.getAssessmentResultDetails);

router.get('/results/status/admin', authenticateToken, adminMiddleware, AssessmentController.getAssessmentResultsForAdmin);

router.get('/navigation/assessee/:assessmentId/:assessorId/:assesseeId', AssessmentController.getNavigationAssessee);
router.get('/navigation/assessor/:assessmentId', authenticateToken, assessorMiddleware, AssessmentController.getNavigationAssessor);
router.get('/navigation/admin/:assessmentId/:assessorId', authenticateToken, adminMiddleware, AssessmentController.getNavigationAdmin);

router.get('/assessment-recapt/:scheduleDetailId', authenticateToken, assessorMiddleware, AssessmentController.getAssessmentRecapt);
router.get('/assessment-recapt/admin/:scheduleDetailId/:assessorId', authenticateToken, adminMiddleware, AssessmentController.getAssessmentRecaptForAdmin);

router.post('/apl-01/create-self-data', APL1Controller.createAssesseeAPL1);
router.post('/apl-01/create-certificate-docs', 
    uploadCertificate.any(), 
    APL1Controller.createOrUploadCertificateDocs
);
router.get('/uploads/apl-01/:folder/:filename', authUpload, (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads/apl-01', folder, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    res.sendFile(filePath);
});
router.get('/apl-01/results', APL1Controller.getAllResult);
router.get('/apl-01/results/assessor/:assessorId', APL1Controller.getResultDocsByAssessorId);
router.get('/apl-01/results/unapproved', APL1Controller.getUnapprovedResult);
router.put('/apl-01/results/:resultId/approve', APL1Controller.approveResult)
router.get('/apl-01/results/:assessmentId', APL1Controller.getResultDocsByAssessmentId);;
router.get('/apl-01/result/:resultId', APL1Controller.getResultDetails);
router.get('/apl-01/result/docs/:resultId', APL1Controller.getResultDocsByResultId);

router.get('/apl-02/units/:resultId', APL02Controller.getUnitsAPL02);
router.get('/apl-02/units/:resultId/elements/:unitId', APL02Controller.getElementsByUnitId);
router.post('/apl-02/result/send', APL02Controller.sendResult);
router.post('/apl-02/result/send-header', APL02Controller.sendResultHeader);
router.get('/apl-02/result/units/:resultId', APL02Controller.getUnitsResult);
router.get('/apl-02/result/units/:resultId/elements/:unitId', APL02Controller.getElementsResult);
router.put('/apl-02/result/assessor/:resultId/approve', APL02Controller.approvedByAssessor);
router.put('/apl-02/result/assessee/:resultId/approve', APL02Controller.approvedByAssessee);
router.get('/apl-02/result/:resultId', APL02Controller.getResultDetails);

router.get('/ia-01/units/:resultId', IA01Controller.getIA01Groups);
router.get('/ia-01/units/:resultId/elements/:unitId', IA01Controller.getElementsByUnitId);
router.post('/ia-01/result/send', IA01Controller.sendResult);
router.post('/ia-01/result/send-header', IA01Controller.sendResultHeader);
router.put('/ia-01/result/assessor/:resultId/approve', IA01Controller.approvedByAssessor);
router.put('/ia-01/result/assessee/:resultId/approve', IA01Controller.approvedByAssessee);
router.get('/ia-01/result/:resultId', IA01Controller.getResultDetails);

router.get('/ia-02/units/:assessmentId', IA02Controller.getIA02Groups);
router.put('/ia-02/result/assessor/:resultId/approve', IA02Controller.approvedByAssessor);
router.put('/ia-02/result/assessee/:resultId/approve', IA02Controller.approvedByAssessee);
router.get('/ia-02/result/:resultId', IA02Controller.getResultDetails);
router.post(
    '/ia-02/upload-pdf/:assessmentId', 
    uploadIA02.single('pdf'), 
    IA02Controller.uploadPdf
);
router.get('/ia-02/pdf/:assessmentId', IA02Controller.getPdf);

router.get('/ia-03/units/:resultId', IA03Controller.getIA03Groups);
router.post('/ia-03/result/send', IA03Controller.sendResult);
router.put('/ia-03/result/assessor/:resultId/approve', IA03Controller.approvedByAssessor);
router.put('/ia-03/result/assessee/:resultId/approve', IA03Controller.approvedByAssessee);
router.get('/ia-03/result/:resultId', IA03Controller.getResultDetails);

router.get('/ia-05/questions/:assessmentId', IA05Controller.getQuestions);
router.get('/ia-05/result/answers/keys/:assessmentId', IA05Controller.getAnswerKeys);
router.get('/ia-05/result/answers/:resultId', IA05Controller.getAssesseeAnswers);
router.post('/ia-05/result/assessee/send', IA05Controller.sendAssesseeResult);
router.post('/ia-05/result/assessor/send', IA05Controller.sendAssessorResult);
router.put('/ia-05/result/assessor/:resultId/approve', IA05Controller.approvedByAssessor);
router.put('/ia-05/result/assessee/:resultId/approve', IA05Controller.approvedByAssessee);
router.get('/ia-05/result/:resultId', IA05Controller.getResultDetails);

router.post('/ak-01', AK01Controller.createAK01);
router.get('/ak-01/:id', AK01Controller.getAK01ById);
router.put('/ak-01/:id', AK01Controller.updateAK01);
router.delete('/ak-01/:id', AK01Controller.deleteAK01);
router.get('/ak-01/data/:resultId', AK01Controller.getDataForAK01);
router.put('/ak-01/result/assessor/:resultId/approve', AK01Controller.approvedByAssessor);
router.put('/ak-01/result/assessee/:resultId/approve', AK01Controller.approvedByAssessee);
router.get('/ak-01/result/:resultId', AK01Controller.getAK01ByResultId);

router.post('/ak-02/result/send', AK02Controller.sendResult);
router.get('/ak-02/units/:assessmentId', AK02Controller.getUnits);
router.get('/ak-02/result/:resultId', AK02Controller.getAK02ByResultId);
router.put('/ak-02/result/assessor/:resultId/approve', AK02Controller.approvedByAssessor);
router.put('/ak-02/result/assessee/:resultId/approve', AK02Controller.approvedByAssessee);

router.post('/ak-03', AK03Controller.createAK03);
router.post('/ak-03/answer', AK03Controller.createAnswerAK03);
router.get('/ak-03/:result_id', AK03Controller.getAK03ByResultId);

router.post('/ak-04', AK04Controller.createAK04);
router.get('/ak-04/:resultId', AK04Controller.getAK04ByResultId);
router.put('/ak-04/result/assessee/:resultId/approve', AK04Controller.approvedByAssessee);

router.post('/ak-05', AK05Controller.createAK05);
router.get('/ak-05/:result_id', AK05Controller.getAK05ByResultId);
router.put('/ak-05/result/assessor/:resultId/approve', AK05Controller.approvedByAssessor);

export default router;