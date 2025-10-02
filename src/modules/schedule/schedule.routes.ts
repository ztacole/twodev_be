import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { adminMiddleware, adminOrAssesseeMiddleware, assesseeMiddleware, assessorMiddleware, authenticateToken } from "../../middleware/auth.middleware";
import { requireApproval } from '../../middleware/approval.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', ScheduleController.getSchedules);
router.get('/active', authenticateToken, adminOrAssesseeMiddleware, ScheduleController.getActiveSchedules);
router.get('/active-assessor', authenticateToken, assessorMiddleware, ScheduleController.getActiveSchedulesAssessor);
router.get('/completed', authenticateToken, assesseeMiddleware, ScheduleController.getCompletedSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.post('/', authenticateToken, adminMiddleware, ScheduleController.createSchedule);
router.put('/:id', authenticateToken, adminMiddleware, ScheduleController.updateSchedule);
router.delete('/:id', authenticateToken, adminMiddleware, requireApproval('schedule'), ScheduleController.deleteSchedule);
router.get('/export/excel', authenticateToken, adminMiddleware, ScheduleController.exportScheduleToExcel);
router.post('/letter-assignment/pdf', authenticateToken, adminMiddleware, ScheduleController.generateLetterAssignment);

export default router;