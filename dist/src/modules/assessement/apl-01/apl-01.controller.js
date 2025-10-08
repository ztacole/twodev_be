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
exports.APL1Controller = void 0;
const apl_01_service_1 = require("./apl-01.service");
const async_handler_1 = require("../../../common/async.handler");
class APL1Controller {
}
exports.APL1Controller = APL1Controller;
_a = APL1Controller;
APL1Controller.createAssesseeAPL1 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requiredFields = [
            'user_id', 'full_name', 'identity_number', 'birth_date',
            'birth_location', 'gender', 'nationality', 'phone_no',
            'address', 'postal_code', 'educational_qualifications'
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} harus diisi`
                });
            }
        }
        const assessee = yield apl_01_service_1.APL1Service.createOrUpdateAssessee(req.body);
        res.status(201).json({
            success: true,
            message: 'Data assessee berhasil disimpan',
            data: assessee
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam membuat assessee',
            error: error.message
        });
    }
}));
APL1Controller.createOrUploadCertificateDocs = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assesseeId = parseInt(req.body.assessee_id);
    const assessorId = parseInt(req.body.assessor_id);
    const assessmentId = parseInt(req.body.assessment_id);
    if (isNaN(assesseeId) || isNaN(assessorId) || isNaN(assessmentId)) {
        return res.status(400).json({
            success: false,
            message: 'assessee_id, assessor_id, assessment_id harus valid'
        });
    }
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length < 5) {
        return res.status(400).json({
            success: false,
            message: 'File belum lengkap. Pastikan semua file yang diperlukan diunggah.'
        });
    }
    try {
        const result = yield apl_01_service_1.APL1Service.createOrUploadCertificate({
            assessee_id: assesseeId,
            assessor_id: assessorId,
            assessment_id: assessmentId,
            bodyData: req.body,
            files
        });
        res.status(201).json({
            success: true,
            message: 'Data sertifikat dan file berhasil disimpan',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan dalam membuat sertifikat',
            error: error.message
        });
    }
}));
APL1Controller.getAllResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield apl_01_service_1.APL1Service.getAllResultDoc();
    res.status(200).json({
        success: true,
        message: 'Semua hasil berhasil diambil',
        data: results
    });
}));
APL1Controller.getResultDocsByAssessmentId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    const results = yield apl_01_service_1.APL1Service.getResultDocsByAssessmentId(assessmentId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: results
    });
}));
APL1Controller.getResultDocsByAssessorId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessorId = Number(req.params.assessorId);
    const results = yield apl_01_service_1.APL1Service.getResultDocsByAssessorId(assessorId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: results
    });
}));
APL1Controller.getUnapprovedResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield apl_01_service_1.APL1Service.getUnapprovedResultDoc();
    res.status(200).json({
        success: true,
        message: 'Semua hasil yang belum disetujui berhasil diambil',
        data: results
    });
}));
APL1Controller.approveResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const resultId = parseInt(req.params.resultId);
    const result = yield apl_01_service_1.APL1Service.approveResultDoc(resultId, user.id);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil disetujui',
        data: result
    });
}));
APL1Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield apl_01_service_1.APL1Service.getResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: 'Detail hasil berhasil diambil',
        data: result
    });
}));
APL1Controller.getResultDocsByResultId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const results = yield apl_01_service_1.APL1Service.getResultDocsByResultId(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: results
    });
}));
