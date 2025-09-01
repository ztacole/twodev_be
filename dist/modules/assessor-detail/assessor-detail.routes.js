"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessor_detail_controller_1 = require("./assessor-detail.controller");
const router = (0, express_1.Router)();
router.get('/:assessorId', assessor_detail_controller_1.AssessorDetailController.getByAssessorId);
router.post('/:assessorId', assessor_detail_controller_1.AssessorDetailController.upsertByAssessorId);
exports.default = router;
