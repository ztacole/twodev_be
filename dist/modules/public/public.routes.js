"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_controller_1 = require("./public.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/assessee/:id", public_controller_1.PublicController.getAssesseeById);
router.get("/assessor/:id", public_controller_1.PublicController.getAssessorById);
exports.default = router;
