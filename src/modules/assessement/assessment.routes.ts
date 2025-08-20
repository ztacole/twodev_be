import { Router } from "express";
import { upload } from "./apl-01/upload-config";
import { APL2Controller } from "./apl-02/apl-02.controller";
import { APL1Controller } from "./apl-01/apl-01.controller";
import { IA01Controller } from "./ia-01/ia-01.controller";
import { AssessmentController } from "./assessment.controller";
import { AKController } from "./ak/ak.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/create', AssessmentController.createAssessment);
router.get('/', AssessmentController.getAssessments);

router.post('/apl-01/create-self-data', APL1Controller.createAssesseAPL1);
router.post('/apl-01/create-certificate-data', APL1Controller.createAssesseCertificate);
router.post('/apl-01/upload-certificate-docs/:assessorId/:assesseeId', upload.any(), APL1Controller.uploadCertificateDocs);

router.get('/apl-02/', APL2Controller.getAssessments);
router.get('/apl-02/:id', APL2Controller.getAssessmentById);
router.get('/apl-02/units/:assessmentCode', APL2Controller.getUnitCompetenciesByAssessmentId);
router.get('/apl-02/units/elements/:unitCompetencyCode', APL2Controller.getElementsByUnitCompetencyId);

router.get('/ia-01/units/:assessmentId', IA01Controller.getIA01Groups);
router.get('/ia-01/units/elements/:unitCode', IA01Controller.getElementsByUnitCode);

router.post('/ak/ak01', AKController.createAK01);
router.get('/ak/ak01/:id', AKController.getAK01ById);
router.get('/ak/ak01/result/:resultId', AKController.getAK01ByResultId);
router.put('/ak/ak01/:id', AKController.updateAK01);
router.delete('/ak/ak01/:id', AKController.deleteAK01);

router.post('/ak/ak02', AKController.createAK02);
router.get('/ak/ak02/:id', AKController.getAK02ById);
router.get('/ak/ak02/result/:resultId', AKController.getAK02ByResultId);
router.put('/ak/ak02/:id', AKController.updateAK02);
router.delete('/ak/ak02/:id', AKController.deleteAK02);

router.get('/ak/result/:resultId', AKController.getAKByResultId);
router.get('/ak', AKController.getAllAK);

export default router;