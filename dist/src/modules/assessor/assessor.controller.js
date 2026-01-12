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
        const requiredFields = ['user_id', 'scheme_id', 'address', 'birth_location', 'institution', 'phone_no', 'birth_date', 'no_reg_met'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} diperlukan`,
                });
            }
        }
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length < 5) {
            return res.status(400).json({
                success: false,
                message: 'File belum lengkap.',
            });
        }
        let existingAssessor = null;
        try {
            existingAssessor = yield assessor_service_1.AssessorService.getAssessorByUserId(req.body.user_id);
        }
        catch (error) {
            // Ignore if assessor doesn't exist (will be created)
        }
        let signatureUrl = undefined;
        const signatureFile = files.find((f) => f.fieldname === 'signature');
        if (signatureFile) {
            if (existingAssessor === null || existingAssessor === void 0 ? void 0 : existingAssessor.signature) {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const oldFilePath = path.join(__dirname, '../../../public', existingAssessor.signature);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
                catch (error) {
                    // Ignore error if file doesn't exist
                }
            }
            signatureUrl = `uploads/signatures/${signatureFile.filename}`;
        }
        const assessor = yield assessor_service_1.AssessorService.createAssessor(Object.assign(Object.assign({}, req.body), { signature: signatureUrl }), files);
        res.status(201).json({
            success: true,
            message: 'Data assessor berhasil dibuat',
            data: assessor,
        });
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
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
    if (!req.query.page || !req.query.limit) {
        const result = yield assessor_service_1.AssessorService.getAllAssessors(keyword);
        return res.json({
            success: true,
            message: 'Data assessor berhasil diambil',
            data: result.data,
        });
    }
    const result = yield assessor_service_1.AssessorService.getAssessors(page, limit, keyword);
    return res.json({
        success: true,
        message: 'Data assessor berhasil diambil',
        data: result.data,
        meta: result.meta,
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
AssessorController.getAssessorUsers = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
        const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
        const users = yield assessor_service_1.AssessorService.getAssessorUsers(page, limit, keyword);
        res.status(200).json({
            success: true,
            message: 'Semua detail assessor berhasil diambil',
            data: users.data,
            meta: users.meta
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
AssessorController.updateMyProfile = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id; // Get user ID from token
    const { full_name, email, password, scheme_id, birth_location, birth_date, no_reg_met, institution, address, phone_no } = req.body;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid atau user tidak ditemukan'
        });
    }
    if (!full_name && !email && !password && !scheme_id && !birth_location &&
        !birth_date && !no_reg_met && !institution && !address && !phone_no) {
        return res.status(400).json({
            success: false,
            message: 'Minimal satu field harus diisi untuk update'
        });
    }
    const files = Array.isArray(req.files) ? req.files : [];
    const existingAssessor = yield assessor_service_1.AssessorService.getAssessorByUserId(userId);
    let signatureUrl = undefined;
    const signatureFile = files.find((f) => f.fieldname === 'signature');
    if (signatureFile) {
        if (existingAssessor === null || existingAssessor === void 0 ? void 0 : existingAssessor.signature) {
            try {
                const fs = require('fs');
                const path = require('path');
                const oldFilePath = path.join(__dirname, '../../../public', existingAssessor.signature);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            catch (error) {
                // Ignore error if file doesn't exist
            }
        }
        signatureUrl = `uploads/signatures/${signatureFile.filename}`;
    }
    const data = yield assessor_service_1.AssessorService.updateAssessorByUserId(userId, {
        full_name,
        email,
        password,
        scheme_id,
        birth_location,
        birth_date,
        no_reg_met,
        institution,
        address,
        phone_no,
        signature: signatureUrl
    }, files);
    res.json({
        success: true,
        message: 'Profil assessor berhasil diperbarui',
        data
    });
}));
