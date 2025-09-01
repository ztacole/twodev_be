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
exports.AssessmentController = void 0;
const assessment_service_1 = require("./assessment.service");
const async_handler_1 = require("../../common/async.handler");
class AssessmentController {
}
exports.AssessmentController = AssessmentController;
_a = AssessmentController;
AssessmentController.createAssessment = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield assessment_service_1.AssessmentService.createAssessment(data);
    res.status(201).json({
        success: true,
        message: "Assessment berhasil dibuat",
        data: result,
    });
}));
AssessmentController.getAssessments = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield assessment_service_1.AssessmentService.getAssessments();
    res.status(200).json({
        success: true,
        message: "Assessment berhasil diambil",
        data: result,
    });
}));
AssessmentController.deleteAssessment = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id) {
        throw new Error("ID is required");
    }
    const result = yield assessment_service_1.AssessmentService.deleteAssessment(id);
    res.status(200).json({
        success: true,
        message: "Assessment berhasil dihapus",
    });
}));
AssessmentController.getAssessmentById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id) {
        throw new Error("ID is required");
    }
    const result = yield assessment_service_1.AssessmentService.getAssessmentById(id);
    res.status(200).json({
        success: true,
        message: "Assessment berhasil diambil",
        data: result,
    });
}));
AssessmentController.getAssessmentResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: "Result ID is required",
        });
    }
    const result = yield assessment_service_1.AssessmentService.getAssessmentResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: "Detail hasil assessment berhasil diambil",
        data: result,
    });
}));
