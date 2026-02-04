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
exports.AssessmentReportController = void 0;
const async_handler_1 = require("../../../common/async.handler");
const assessmentReport_service_1 = require("./assessmentReport.service");
class AssessmentReportController {
}
exports.AssessmentReportController = AssessmentReportController;
_a = AssessmentReportController;
AssessmentReportController.getAssessmentReport = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId)
        return res.status(400).json({ success: false, message: "ID assessment harus diisi", });
    const result = yield assessmentReport_service_1.AssessmentReportService.getAssessmentReport(assessmentId);
    res.status(200).json({
        success: true,
        message: "Report berhasil diambil",
        data: result,
    });
}));
AssessmentReportController.createAssessmentReport = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield assessmentReport_service_1.AssessmentReportService.createAssessmentReport(data);
    res.status(200).json({
        success: true,
        message: "Report berhasil dibuat",
        data: result,
    });
}));
AssessmentReportController.updateAssessmentReport = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId)
        return res.status(400).json({ success: false, message: "ID assessment harus diisi", });
    const data = req.body;
    const result = yield assessmentReport_service_1.AssessmentReportService.updateAssessmentReport(assessmentId, data);
    res.status(200).json({
        success: true,
        message: "Report berhasil diupdate",
        data: result,
    });
}));
