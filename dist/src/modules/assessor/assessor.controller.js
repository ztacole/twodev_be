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
    try {
        const requiredFields = ['user_id', 'scheme_id', 'address', 'phone_no', 'birth_date', 'no_reg_met'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} diperlukan`,
                });
            }
        }
        const files = Array.isArray(req.files) ? req.files : [];
        const assessor = yield assessor_service_1.AssessorService.createAssessor(req.body);
        if (files.length > 0) {
            const fs = require('fs');
            const path = require('path');
            const newDir = path.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessor.id}`);
            if (fs.existsSync(newDir)) {
                fs.readdirSync(newDir).forEach((file) => {
                    const filePath = path.join(newDir, file);
                    fs.unlinkSync(filePath);
                });
            }
            for (const file of files) {
                const oldPath = path.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                const newPath = path.join(newDir, file.filename);
                if (!fs.existsSync(newDir)) {
                    fs.mkdirSync(newDir, { recursive: true });
                }
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                }
            }
            const detail = yield assessor_service_1.AssessorService.createOrUpdateAssessorDetail({
                assessorId: assessor.id,
                bodyData: req.body,
                files
            });
            res.status(201).json({
                success: true,
                message: 'Data assessor dan detail berhasil dibuat',
                data: {
                    assessor,
                    detail
                }
            });
        }
        else {
            res.status(201).json({
                success: true,
                message: 'Data assessor berhasil dibuat',
                data: assessor,
            });
        }
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam membuat assessor',
            error: error.message
        });
    }
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
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        const assessor = yield assessor_service_1.AssessorService.updateAssessor(Number(req.params.id), req.body);
        if (files.length > 0) {
            const detail = yield assessor_service_1.AssessorService.createOrUpdateAssessorDetail({
                assessorId: Number(req.params.id),
                bodyData: req.body,
                files
            });
            res.json({
                success: true,
                message: 'Data assessor dan detail berhasil diubah',
                data: {
                    assessor,
                    detail
                }
            });
        }
        else {
            res.json({
                success: true,
                message: 'Data assessor berhasil diubah',
                data: assessor,
            });
        }
    }
    catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam mengubah assessor',
            error: error.message
        });
    }
}));
AssessorController.deleteAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield assessor_service_1.AssessorService.deleteAssessor(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessor berhasil dihapus',
    });
}));
AssessorController.createOrUpdateAssessorDetail = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessorId = parseInt(req.body.assessor_id || req.body.assessorId);
        if (isNaN(assessorId)) {
            return res.status(400).json({
                success: false,
                message: 'assessor_id harus valid'
            });
        }
        const files = Array.isArray(req.files) ? req.files : [];
        const result = yield assessor_service_1.AssessorService.createOrUpdateAssessorDetail({
            assessorId,
            bodyData: req.body,
            files
        });
        res.status(201).json({
            success: true,
            message: 'Data detail assessor berhasil disimpan',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam menyimpan detail assessor',
            error: error.message
        });
    }
}));
AssessorController.getAssessorDetail = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessorId = parseInt(req.params.assessorId);
        if (isNaN(assessorId)) {
            return res.status(400).json({
                success: false,
                message: 'Assessor ID harus valid'
            });
        }
        const result = yield assessor_service_1.AssessorService.getAssessorDetail(assessorId);
        res.status(200).json({
            success: true,
            message: 'Detail assessor berhasil diambil',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam mengambil detail assessor',
            error: error.message
        });
    }
}));
AssessorController.getAllAssessorDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield assessor_service_1.AssessorService.getAllAssessorDetails();
        res.status(200).json({
            success: true,
            message: 'Semua detail assessor berhasil diambil',
            data: results
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam mengambil detail assessor',
            error: error.message
        });
    }
}));
