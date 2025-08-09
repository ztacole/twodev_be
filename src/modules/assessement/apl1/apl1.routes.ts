import { Router } from 'express';
import { Apl1Controller } from './apl1.controller';
import { upload } from './upload-config';

const router = Router();
const controller = new Apl1Controller();

router.post('/create-self-data', controller.createAssesseAPL1.bind(controller));
router.post('/create-certificate-data', controller.createAssesseCertificate.bind(controller));
router.post('/upload-certificate-docs/:assessorId/:assesseeId', upload.any(), controller.uploadCertificateDocs.bind(controller));

export default router;