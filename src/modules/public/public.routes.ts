import { PublicController } from "./public.controller";
import { Router } from "express";

const router = Router();

router.get("/assessee/:id", PublicController.getAssesseeById);
router.get("/assessor/:id", PublicController.getAssessorById);

export default router;