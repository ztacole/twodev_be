import { Router } from 'express';
import { UploadsController } from './uploads.controller';
import { authenticateToken } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/', UploadsController.uploadFiles);

export default router;
