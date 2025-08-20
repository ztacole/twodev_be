import { Router } from 'express';
import { Apl1Controller } from './apl1.controller';
import { upload } from './upload-config';

const router = Router();
const controller = new Apl1Controller();

router.post('/create-self-data', controller.createAssesseeAPL1);
router.post('/create-certificate-data', controller.createAssesseeCertificate);
router.post('/upload-certificate-docs/:assessorId/:assesseeId', 
    upload.any(), 
    controller.uploadCertificateDocs
);

export default router;