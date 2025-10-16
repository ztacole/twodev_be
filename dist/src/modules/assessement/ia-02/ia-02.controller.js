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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IA02Controller = void 0;
const ia_02_service_1 = require("./ia-02.service");
const async_handler_1 = require("../../../common/async.handler");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class IA02Controller {
    static uploadPdf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = Number(req.params.assessmentId);
                if (!assessmentId) {
                    return res.status(400).json({
                        success: false,
                        message: "Assessment ID dibutuhkan",
                    });
                }
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "Tidak ada file yang diunggah",
                    });
                }
                const fileName = req.file.filename;
                const filePath = req.file.path;
                const pdf = yield ia_02_service_1.IAO2Service.uploadPdf(assessmentId, filePath, fileName);
                return res.status(201).json({
                    success: true,
                    message: "PDF berhasil diupload",
                    data: pdf,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal upload PDF",
                    error: error.message,
                });
            }
        });
    }
    static getPdf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scheduleId = Number(req.params.scheduleId);
                if (!scheduleId) {
                    return res.status(400).json({
                        success: false,
                        message: "Schedule ID dibutuhkan",
                    });
                }
                const pdf = yield ia_02_service_1.IAO2Service.getPdf(scheduleId);
                if (!pdf) {
                    return res.status(404).json({
                        success: false,
                        message: "PDF tidak ditemukan",
                    });
                }
                const filePath = path_1.default.join(__dirname, "../../../../public/uploads/ia-02", `assessment-${scheduleId}`, pdf.file_name);
                if (!fs_1.default.existsSync(filePath)) {
                    return res.status(404).json({
                        success: false,
                        message: "File PDF tidak ditemukan di server",
                    });
                }
                return res.download(filePath, pdf.file_name);
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengambil PDF",
                    error: error.message,
                });
            }
        });
    }
}
exports.IA02Controller = IA02Controller;
_a = IA02Controller;
IA02Controller.getIA02Groups = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) {
        return res.status(400).json({ success: false, message: 'Assessment ID is required' });
    }
    const iaGroups = yield ia_02_service_1.IAO2Service.getIA02Groups(assessmentId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA02Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const iaGroups = yield ia_02_service_1.IAO2Service.approveByAssessor(resultId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA02Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const iaGroups = yield ia_02_service_1.IAO2Service.approveByAssessee(resultId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA02Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_02_service_1.IAO2Service.getResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result
    });
}));
