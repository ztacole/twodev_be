import { Router } from 'express';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.get('/', dashboardController.getDashboardData);

export default router;