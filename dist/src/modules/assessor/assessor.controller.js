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
exports.AssessorController = void 0;
const assessor_service_1 = require("./assessor.service");
const async_handler_1 = require("../../common/async.handler");
class AssessorController {
}
exports.AssessorController = AssessorController;
_a = AssessorController;
AssessorController.createAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = ['user_id', 'scheme_id', 'address', 'phone_no', 'birth_date', 'no_reg_met'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `Field ${field} diperlukan`,
            });
        }
    }
    const assessor = yield assessor_service_1.AssessorService.createAssessor(req.body);
    res.status(201).json({
        success: true,
        message: 'Data assessor berhasil dibuat',
        data: assessor,
    });
}));
AssessorController.getAssessors = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessors = yield assessor_service_1.AssessorService.getAssessors();
    res.json({
        success: true,
        message: 'Data assessor berhasil diambil',
        data: assessors,
    });
}));
AssessorController.getAssessorById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessor = yield assessor_service_1.AssessorService.getAssessorById(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessor berhasil diambil',
        data: assessor,
    });
}));
AssessorController.getAssessorByUserId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessor = yield assessor_service_1.AssessorService.getAssessorByUserId(Number(req.params.userId));
    res.json({
        success: true,
        message: 'Data assessor berhasil diambil',
        data: assessor,
    });
}));
AssessorController.updateAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessor = yield assessor_service_1.AssessorService.updateAssessor(Number(req.params.id), req.body);
    res.json({
        success: true,
        message: 'Data assessor berhasil diubah',
        data: assessor,
    });
}));
AssessorController.deleteAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield assessor_service_1.AssessorService.deleteAssessor(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessor berhasil dihapus',
    });
}));
