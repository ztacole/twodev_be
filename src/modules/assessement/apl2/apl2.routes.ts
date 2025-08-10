import { Router } from "express";
import { APL2Controller } from "./apl2.controller";

const router = Router();
const controller = new APL2Controller();

router.post('/create-assessment', controller.createAssessment.bind(controller));
router.get('/', controller.getAssessments.bind(controller));
router.get('/:id', controller.getAssessmentById.bind(controller));
router.get('/unit-competencies/:assessmentId', controller.getUnitCompetenciesByAssessmentId.bind(controller));
router.get('/unit-competencies/elements/:unitCompetencyId', controller.getElementsByUnitCompetencyId.bind(controller));

export default router;