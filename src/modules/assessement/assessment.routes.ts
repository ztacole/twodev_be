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
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/create', AssessmentController.createAssessment);
router.get('/', AssessmentController.getAssessments);
router.get('/:id', AssessmentController.getAssessmentById);
router.delete('/:id', AssessmentController.deleteAssessment);

router.post('/apl-01/create-self-data', APL1Controller.createAssesseeAPL1);
router.post('/apl-01/create-certificate-data', APL1Controller.createAssesseeCertificate);
router.put('/apl-01/upload-certificate-docs/:assessorId/:assesseeId', 
    upload.any(), 
    APL1Controller.uploadCertificateDocs
);
router.get('/apl-01/results', APL1Controller.getAllResult);
router.get('/apl-01/results/unapproved', APL1Controller.getUnapprovedResult);
router.put('/apl-01/results/:resultId/approve', APL1Controller.approveResult);

router.get('/apl-02/units/:assessmentId', APL02Controller.getUnitsAPL02);
router.get('/apl-02/units/elements/:unitId', APL02Controller.getElementsByUnitId);

router.get('/ia-01/units/:assessmentId', IA01Controller.getIA01Groups);
router.get('/ia-01/units/elements/:unitId', IA01Controller.getElementsByUnitId);

router.get('/ia-02/units/:assessmentId', IA02Controller.getIA02Groups);

router.get('/ia-03/units/:assessmentId', IA03Controller.getIA03Groups);

router.get('/ia-05/questions/:assessmentId', IA05Controller.getQuestions);
router.get('/ia-05/answers/:assessmentId', IA05Controller.getAnswers);
router.get('/ia-05/answers/assessee/:assesseeId', IA05Controller.getAssesseeAnswers);

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

export default router;