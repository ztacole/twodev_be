import { Router } from "express";
import { upload } from "./apl-01/upload-config";
import { APL2Controller } from "./apl-02/apl-02.controller";
import { APL1Controller } from "./apl-01/apl-01.controller";
import { IA01Controller } from "./ia-01/ia-01.controller";
import { AssessmentController } from "./assessment.controller";

const router = Router();

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

export default router;