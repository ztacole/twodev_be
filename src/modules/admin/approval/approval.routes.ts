import { Router } from "express";
import { ApprovalController } from "./approval.controller";
import { authenticateToken, adminMiddleware } from "../../../middleware/auth.middleware";

const router = Router();

router.post("/apl01", authenticateToken, adminMiddleware, ApprovalController.approveApl01);

router.post("/competency", authenticateToken, adminMiddleware, ApprovalController.approveCompetency);

router.post("/request", authenticateToken, adminMiddleware, ApprovalController.createApprovalRequest);
router.post(
  "/:id/approve",
  authenticateToken,
  adminMiddleware,
  ApprovalController.approveRequest
);
router.post(
  "/:id/reject",
  authenticateToken,
  adminMiddleware,
  ApprovalController.rejectRequest
);
router.get(
  "/requests/scope/:scope",
  authenticateToken,
  adminMiddleware,
  ApprovalController.listApprovalRequests
);
router.get(
  "/requests",
  authenticateToken,
  adminMiddleware,
  ApprovalController.listApprovalRequests
);

export default router;
