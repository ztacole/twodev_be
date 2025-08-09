import { Router } from "express";
import { APL2Controller } from "./apl2.controller";

const router = Router();
const controller = new APL2Controller();

router.post('/create-assessment', controller.createAssessment.bind(controller));
router.get('/assessments', controller.getAssessments.bind(controller));
router.get('/assessments/:id', controller.getAssessmentById.bind(controller));

export default router;