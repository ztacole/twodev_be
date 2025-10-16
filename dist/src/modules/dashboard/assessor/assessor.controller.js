"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAssessorController = void 0;
const assessor_service_1 = require("./assessor.service");
const async_handler_1 = require("../../../common/async.handler");
class DashboardAssessorController {
}
exports.DashboardAssessorController = DashboardAssessorController;
_a = DashboardAssessorController;
DashboardAssessorController.getAPL02Assessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessorId = Number(req.params.assessorId);
    const scheduleId = Number(req.params.scheduleId);
    const type = req.params.type;
    if (!scheduleId || !assessorId || !type) {
        return res.status(400).json({ success: false, message: 'Assessor ID, Schedule ID, dan Type is required' });
    }
    const data = yield assessor_service_1.DashboardAssessorService.getAssesseeData(assessorId, scheduleId, type);
    res.json({
        success: true,
        message: 'Data assessment mandiri berhasil diambil',
        data,
    });
}));
