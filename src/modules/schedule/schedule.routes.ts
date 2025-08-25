import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { assesseeMiddleware, authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

router.get('/', ScheduleController.getSchedules);
router.get('/active', authenticateToken, assesseeMiddleware, ScheduleController.getActiveSchedules);
router.get('/completed', ScheduleController.getCompletedSchedules);
router.get('/completed/:assesseeId', ScheduleController.getCompletedSchedulesByAssesseeId);
router.get('/:id', authenticateToken, assesseeMiddleware, ScheduleController.getScheduleById);
router.post('/', ScheduleController.createSchedule);
router.delete('/:id', ScheduleController.deleteSchedule);
router.get('/export/excel', ScheduleController.exportScheduleToExcel);

export default router;