import { Router } from 'express';
import { Apl1Controller } from './apl1.controller';

const router = Router();
const controller = new Apl1Controller();

router.post('/create-self-data', controller.createAssesseAPL1.bind(controller));
router.post('/create-certificate-data', controller.createAssesseCertificate.bind(controller));

export default router;