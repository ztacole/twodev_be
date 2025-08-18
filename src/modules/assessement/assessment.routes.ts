import { Router } from "express";
import { upload } from "./apl1/upload-config";
import { APL2Controller } from "./apl2/apl2.controller";
import { APL1Controller } from "./apl1/apl1.controller";
import { IAGroupController } from "./iaGroup/iaGroup.controller";

const router = Router();

router.post('/apl1/create-self-data', APL1Controller.createAssesseAPL1);
router.post('/apl1/create-certificate-data', APL1Controller.createAssesseCertificate);
router.post('/apl1/upload-certificate-docs/:assessorId/:assesseeId', upload.any(), APL1Controller.uploadCertificateDocs);

router.post('/apl2/create-assessment', APL2Controller.createAssessment);
router.get('/apl2/', APL2Controller.getAssessments);
router.get('/apl2/:id', APL2Controller.getAssessmentById);
router.get('/apl2/unit-competencies/:assessmentCode', APL2Controller.getUnitCompetenciesByAssessmentId);
router.get('/apl2/unit-competencies/elements/:unitCompetencyCode', APL2Controller.getElementsByUnitCompetencyId);

router.post('/ia-group/create', IAGroupController.createIAGroup);

export default router;