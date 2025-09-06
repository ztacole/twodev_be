"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./admin/dashboard.controller");
const assessor_controller_1 = require("./assessor/assessor.controller");
const router = (0, express_1.Router)();
// admin
router.get('/admin/', dashboard_controller_1.DashboardController.getDashboardData);
router.get('/admin/summary', dashboard_controller_1.DashboardController.getSummary);
router.get('/admin/schedules', dashboard_controller_1.DashboardController.getSchedules);
router.get('/admin/verifications', dashboard_controller_1.DashboardController.getVerificationDocs);
// assessor
router.get('/assessor/:assessorId/:assessmentId/:type', assessor_controller_1.DashboardAssessorController.getAPL02Assessee);
exports.default = router;
