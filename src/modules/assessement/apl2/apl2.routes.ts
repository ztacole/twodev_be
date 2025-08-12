import { Router } from "express";
import { APL2Controller } from "./apl2.controller";

const router = Router();

router.post('/create-assessment', APL2Controller.createAssessment);
router.get('/', APL2Controller.getAssessments);
router.get('/:id', APL2Controller.getAssessmentById);
router.get('/unit-competencies/:assessmentCode', APL2Controller.getUnitCompetenciesByAssessmentId);
router.get('/unit-competencies/elements/:unitCompetencyCode', APL2Controller.getElementsByUnitCompetencyId);

export default router;