"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./admin/dashboard.controller");
const assessor_controller_1 = require("./assessor/assessor.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// admin
router.get('/admin/', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, dashboard_controller_1.DashboardController.getDashboardData);
router.get('/admin/summary', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, dashboard_controller_1.DashboardController.getSummary);
router.get('/admin/schedules', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, dashboard_controller_1.DashboardController.getSchedules);
router.get('/admin/verifications', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, dashboard_controller_1.DashboardController.getVerificationDocs);
// assessor
router.get('/assessor/:assessorId/:assessmentId/:type', auth_middleware_1.authenticateToken, auth_middleware_1.assessorMiddleware, assessor_controller_1.DashboardAssessorController.getAPL02Assessee);
exports.default = router;
