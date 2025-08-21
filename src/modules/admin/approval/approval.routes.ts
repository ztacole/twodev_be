import { Router } from "express";
import { ApprovalController } from "./approval.controller";
import { authenticateToken, adminMiddleware } from "../../../middleware/auth.middleware";

const router = Router();

router.post("/apl01", authenticateToken, adminMiddleware, ApprovalController.approveApl01);

router.post("/competency", authenticateToken, adminMiddleware, ApprovalController.approveCompetency);

export default router;
