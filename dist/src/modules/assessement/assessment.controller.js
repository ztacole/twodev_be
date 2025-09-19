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
const assessor_service_1 = require("../assessor/assessor.service");
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
        return res.status(400).json({
            success: false,
            message: "ID assessment harus diisi",
        });
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
        return res.status(400).json({
            success: false,
            message: "ID assessment harus diisi",
        });
    }
    const result = yield assessment_service_1.AssessmentService.getAssessmentById(id);
    res.status(200).json({
        success: true,
        message: "Assessment berhasil diambil",
        data: result,
    });
}));
AssessmentController.getAssessmentResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    const assessorId = Number(req.params.assessorId);
    let assesseeId = Number(req.params.assesseeId);
    if (!assessmentId || !assessorId) {
        return res.status(400).json({
            success: false,
            message: "Assessment ID, Assessor ID, dan Assessee ID harus diisi",
        });
    }
    if (!assesseeId) {
        const user = req.user;
        assesseeId = yield assessment_service_1.AssessmentService.findAssesseeByUserId(assessmentId, assessorId, user.id);
        if (assesseeId === 0) {
            return res.status(400).json({
                success: false,
                message: "Assessee tidak ditemukan untuk user ini",
            });
        }
    }
    const result = yield assessment_service_1.AssessmentService.getAssessmentResultDetails(assessmentId, assessorId, assesseeId);
    res.status(200).json({
        success: true,
        message: "Detail hasil assessment berhasil diambil",
        data: result,
    });
}));
AssessmentController.getNavigationAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    const assessorId = Number(req.params.assessorId);
    const assesseeId = Number(req.params.assesseeId);
    if (!assessmentId || !assessorId || !assesseeId) {
        return res.status(400).json({
            success: false,
            message: "Assessment ID, Assessor ID, dan Assessee ID harus diisi",
        });
    }
    const result = yield assessment_service_1.AssessmentService.assesseeNavigation(assessmentId, assessorId, assesseeId);
    res.status(200).json({
        success: true,
        message: "Navigasi berhasil diambil",
        data: result,
    });
}));
AssessmentController.getNavigationAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const assessor = yield assessor_service_1.AssessorService.getAssessorByUserId(user.id);
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) {
        return res.status(400).json({
            success: false,
            message: "Assessment ID harus diisi",
        });
    }
    const result = yield assessment_service_1.AssessmentService.assessorNavigation(assessmentId, assessor.id);
    res.status(200).json({
        success: true,
        message: "Navigasi berhasil diambil",
        data: result,
    });
}));
AssessmentController.getNavigationAdmin = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: "Result ID harus diisi",
        });
    }
    const result = yield assessment_service_1.AssessmentService.adminNavigation(resultId);
    res.status(200).json({
        success: true,
        message: "Navigasi berhasil diambil",
        data: result,
    });
}));
AssessmentController.getAssessmentRecapt = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const scheduleDetailId = Number(req.params.scheduleDetailId);
    if (!scheduleDetailId) {
        return res.status(400).json({
            success: false,
            message: "Schedule ID harus diisi",
        });
    }
    const assessor = yield assessor_service_1.AssessorService.getAssessorByUserId(user.id);
    if (!assessor) {
        return res.status(404).json({
            success: false,
            message: "Assessor tidak ditemukan",
        });
    }
    const result = yield assessment_service_1.AssessmentService.getAssessmentRecapt(scheduleDetailId, assessor);
    res.status(200).json({
        success: true,
        message: "Navigasi berhasil diambil",
        data: result,
    });
}));
AssessmentController.getAssessmentRecaptForAdmin = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleDetailId = Number(req.params.scheduleDetailId);
    const assessorId = Number(req.params.assessorId);
    if (!scheduleDetailId || !assessorId) {
        return res.status(400).json({
            success: false,
            message: "Schedule ID dan Assessor ID harus diisi",
        });
    }
    const assessor = yield assessor_service_1.AssessorService.getAssessorById(assessorId);
    if (!assessor) {
        return res.status(404).json({
            success: false,
            message: "Assessor tidak ditemukan",
        });
    }
    const result = yield assessment_service_1.AssessmentService.getAssessmentRecapt(scheduleDetailId, assessor);
    res.status(200).json({
        success: true,
        message: "Navigasi berhasil diambil",
        data: result,
    });
}));
AssessmentController.getAssessmentResultsForAdmin = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield assessment_service_1.AssessmentService.getAssessmentResultsForAdmin();
    res.status(200).json({
        success: true,
        message: "Hasil assessment berhasil diambil",
        data: result,
    });
}));
AssessmentController.getAssesseesByAssessmentAndAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    const assessorId = Number(req.params.assessorId);
    if (!assessmentId || !assessorId) {
        return res.status(400).json({
            success: false,
            message: "Assessment ID dan Assessor ID harus diisi",
        });
    }
    const result = yield assessment_service_1.AssessmentService.getAssesseesByAssessmentAndAssessor(assessmentId, assessorId);
    res.status(200).json({
        success: true,
        message: "Navigasi berhasil diambil",
        data: result,
    });
}));
AssessmentController.generateRecaptPdf = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const scheduleDetailId = Number(req.params.scheduleDetailId);
    if (!scheduleDetailId) {
        return res.status(400).json({
            success: false,
            message: "Schedule ID harus diisi",
        });
    }
    const assessor = yield assessor_service_1.AssessorService.getAssessorByUserId(user.id);
    if (!assessor) {
        return res.status(404).json({
            success: false,
            message: "Assessor tidak ditemukan",
        });
    }
    const data = yield assessment_service_1.AssessmentService.getAssessmentRecapt(scheduleDetailId, assessor);
    const pdfBytes = yield assessment_service_1.AssessmentService.generateRecaptPDF(data.assessment);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=rekap-${scheduleDetailId}.pdf`);
    res.send(Buffer.from(pdfBytes));
}));
AssessmentController.generateRecaptPdfForAdmin = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleDetailId = Number(req.params.scheduleDetailId);
    if (!scheduleDetailId) {
        return res.status(400).json({
            success: false,
            message: "Schedule ID dan Assessor ID harus diisi",
        });
    }
    const assessorId = Number(req.params.assessorId);
    if (!assessorId) {
        return res.status(400).json({
            success: false,
            message: "Assessor ID harus diisi",
        });
    }
    const assessor = yield assessor_service_1.AssessorService.getAssessorById(assessorId);
    if (!assessor) {
        return res.status(404).json({
            success: false,
            message: "Assessor tidak ditemukan",
        });
    }
    const data = yield assessment_service_1.AssessmentService.getAssessmentRecapt(scheduleDetailId, assessor);
    const pdfBytes = yield assessment_service_1.AssessmentService.generateRecaptPDF(data.assessment);
    const safe = (str) => str.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
    const code = safe(data.assessment.code);
    const assessorName = safe(assessor.name);
    const startDate = new Date(data.assessment.schedule.start_date)
        .toISOString()
        .split("T")[0];
    const endDate = new Date(data.assessment.schedule.end_date)
        .toISOString()
        .split("T")[0];
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=rekap-${code}-${assessorName}-${startDate}_sampai_${endDate}.pdf`);
    res.send(Buffer.from(pdfBytes));
}));
