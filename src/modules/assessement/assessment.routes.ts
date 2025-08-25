import { Router } from "express";
import { upload } from "./apl-01/upload-config";
import { APL02Controller } from "./apl-02/apl-02.controller";
import { APL1Controller } from "./apl-01/apl-01.controller";
import { IA01Controller } from "./ia-01/ia-01.controller";
import { IA02Controller } from "./ia-02/ia-02.controller";
import { IA03Controller } from "./ia-03/ia-03.controller";
import { IA05Controller } from "./ia-05/ia-05.controller";
import { AssessmentController } from "./assessment.controller";
import { AKController } from "./ak/ak.controller";
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

router.post('/apl-01/create-self-data', APL1Controller.createAssesseeAPL1);
router.post('/apl-01/create-certificate-docs', 
    upload.any(), 
    APL1Controller.createOrUploadCertificateDocs
);
router.get('/apl-01/results', APL1Controller.getAllResult);
router.get('/apl-01/results/assessor/:assessorId', APL1Controller.getResultDocsByAssessorId);
router.get('/apl-01/results/unapproved', APL1Controller.getUnapprovedResult);
router.put('/apl-01/results/:resultId/approve', APL1Controller.approveResult)
router.get('/apl-01/results/:assessmentId', APL1Controller.getResultDocsByAssessmentId);;

router.get('/apl-02/units/:resultId', APL02Controller.getUnitsAPL02);
router.get('/apl-02/units/:resultId/elements/:unitId', APL02Controller.getElementsByUnitId);
router.post('/apl-02/result/send', APL02Controller.sendResult);
router.get('/apl-02/result/units/:resultId', APL02Controller.getUnitsResult);
router.get('/apl-02/result/units/elements/:resultId/:unitId', APL02Controller.getElementsResult);
router.put('/apl-02/result/assessor/:resultId/approve', APL02Controller.approvedByAssessor);
router.put('/apl-02/result/assessee/:resultId/approve', APL02Controller.approvedByAssessee);

router.get('/ia-01/units/:resultId', IA01Controller.getIA01Groups);
router.get('/ia-01/units/:resultId/elements/:unitId', IA01Controller.getElementsByUnitId);
router.post('/ia-01/result/send', IA01Controller.sendResult);
router.put('/ia-01/result/assessor/:resultId/approve', IA01Controller.approvedByAssessor);
router.put('/ia-01/result/assessee/:resultId/approve', IA01Controller.approvedByAssessee);

router.get('/ia-02/units/:assessmentId', IA02Controller.getIA02Groups);
router.put('/ia-02/result/assessor/:resultId/approve', IA02Controller.approvedByAssessor);
router.put('/ia-02/result/assessee/:resultId/approve', IA02Controller.approvedByAssessee);

router.get('/ia-03/units/:resultId', IA03Controller.getIA03Groups);
router.post('/ia-03/result/send', IA03Controller.sendResult);
router.put('/ia-03/result/assessor/:resultId/approve', IA03Controller.approvedByAssessor);
router.put('/ia-03/result/assessee/:resultId/approve', IA03Controller.approvedByAssessee);

router.get('/ia-05/questions/:assessmentId', IA05Controller.getQuestions);
router.get('/ia-05/result/answers/keys/:assessmentId', IA05Controller.getAnswerKeys);
router.get('/ia-05/result/answers/:resultId', IA05Controller.getAssesseeAnswers);
router.post('/ia-05/result/assessee/send', IA05Controller.sendAssesseeResult);
router.post('/ia-05/result/assessor/send', IA05Controller.sendAssessorResult);
router.put('/ia-05/result/assessor/:resultId/approve', IA05Controller.approvedByAssessor);
router.put('/ia-05/result/assessee/:resultId/approve', IA05Controller.approvedByAssessee);

router.post('/ak-01', AKController.createAK01);
router.get('/ak-01/:id', AKController.getAK01ById);
router.get('/ak-01/result/:resultId', AKController.getAK01ByResultId);
router.put('/ak-01/:id', AKController.updateAK01);
router.delete('/ak-01/:id', AKController.deleteAK01);

router.post('/ak-02', AKController.createAK02);
router.get('/ak-02/:id', AKController.getAK02ById);
router.get('/ak-02/result/:resultId', AKController.getAK02ByResultId);
router.put('/ak-02/:id', AKController.updateAK02);
router.delete('/ak-02/:id', AKController.deleteAK02);

router.get('/ak/result/:resultId', AKController.getAKByResultId);
router.get('/ak', AKController.getAllAK);

router.post('/ak-03', AK03Controller.createAK03);
router.get('/ak-03/:result_id', AK03Controller.getAK03ByResultId);
router.post('/ak-04', AK04Controller.createAK04);
router.get('/ak-04/:resultId', AK04Controller.getAK04ByResultId);
router.post('/ak-05', AK05Controller.createAK05);
router.get('/ak-05/:result_id', AK05Controller.getAK05ByResultId);

export default router;