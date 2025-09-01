"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approval_controller_1 = require("./approval.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/apl01", auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, approval_controller_1.ApprovalController.approveApl01);
router.post("/competency", auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, approval_controller_1.ApprovalController.approveCompetency);
exports.default = router;
