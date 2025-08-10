import { Router } from "express";
import { ScheduleController } from "./schedule.controller";

const router = Router();
const controller = new ScheduleController();

router.get('/', controller.getSchedules.bind(controller));
router.get('/active', controller.getActiveSchedules.bind(controller));
router.get('/completed', controller.getCompletedSchedules.bind(controller));
router.get('/completed/:assesseeId', controller.getCompletedSchedulesByAssesseeId.bind(controller));
router.get('/:id', controller.getScheduleById.bind(controller));

router.post('/', controller.createSchedule.bind(controller));
router.get('/export/excel', controller.exportScheduleToExcel.bind(controller));

export default router;