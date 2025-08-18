import { Router } from 'express';
import { AKController } from './ak.controller';
import { authenticateToken } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// AK01 Routes
router.post('/ak01', AKController.createAK01);
router.get('/ak01/:id', AKController.getAK01ById);
router.get('/ak01/result/:resultId', AKController.getAK01ByResultId);
router.put('/ak01/:id', AKController.updateAK01);
router.delete('/ak01/:id', AKController.deleteAK01);

// AK02 Routes
router.post('/ak02', AKController.createAK02);
router.get('/ak02/:id', AKController.getAK02ById);
router.get('/ak02/result/:resultId', AKController.getAK02ByResultId);
router.put('/ak02/:id', AKController.updateAK02);
router.delete('/ak02/:id', AKController.deleteAK02);

// Combined Routes
router.get('/result/:resultId', AKController.getAKByResultId);
router.get('/', AKController.getAllAK);

export default router;