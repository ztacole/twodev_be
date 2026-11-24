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
exports.AssesseeController = void 0;
const asseessee_service_1 = require("./asseessee.service");
const async_handler_1 = require("../../common/async.handler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AssesseeController {
}
exports.AssesseeController = AssesseeController;
_a = AssesseeController;
AssesseeController.createAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = [
        'user_id', 'identity_number', 'birth_date', 'birth_location', 'gender',
        'nationality', 'phone_no', 'address', 'educational_qualifications'
    ];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `Field ${field} diperlukan`,
            });
        }
    }
    let signatureUrl = undefined;
    const files = req.files;
    if (files && files.signature && files.signature[0]) {
        signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
    }
    const assesseeData = Object.assign(Object.assign({}, req.body), { signature: signatureUrl });
    const assessee = yield asseessee_service_1.AssesseeService.createAssessee(assesseeData);
    res.status(201).json({
        success: true,
        message: 'Data assessee berhasil dibuat',
        data: assessee,
    });
}));
AssesseeController.getAssessees = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
    const occupation_id = req.query.occupation_id ? Number(req.query.occupation_id) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const result = yield asseessee_service_1.AssesseeService.getAssessees(page, limit, keyword, occupation_id, year);
    return res.json({
        success: true,
        message: 'Data assessee berhasil diambil',
        data: result.data,
        meta: result.meta,
    });
}));
AssesseeController.getAssesseeById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessee = yield asseessee_service_1.AssesseeService.getAssesseeById(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessee berhasil diambil',
        data: assessee,
    });
}));
AssesseeController.updateAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let signatureUrl = undefined;
    const files = req.files;
    const existingAssessee = yield asseessee_service_1.AssesseeService.getAssesseeById(Number(req.params.id));
    if (files && files.signature && files.signature[0]) {
        if (existingAssessee === null || existingAssessee === void 0 ? void 0 : existingAssessee.signature) {
            try {
                const oldFilePath = path_1.default.join(__dirname, '../../../public', existingAssessee.signature);
                if (fs_1.default.existsSync(oldFilePath)) {
                    fs_1.default.unlinkSync(oldFilePath);
                }
            }
            catch (err) {
                console.error('Gagal menghapus signature lama:', err);
            }
        }
        signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
    }
    const assesseeData = Object.assign(Object.assign({}, req.body), { signature: signatureUrl || (existingAssessee === null || existingAssessee === void 0 ? void 0 : existingAssessee.signature) });
    const assessee = yield asseessee_service_1.AssesseeService.updateAssessee(Number(req.params.id), assesseeData);
    res.json({
        success: true,
        message: 'Data assessee berhasil diperbarui',
        data: assessee,
    });
}));
AssesseeController.deleteAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield asseessee_service_1.AssesseeService.deleteAssessee(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessee berhasil dihapus',
    });
}));
AssesseeController.exportAssesseesToExcel = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { occupation_id, scheme_id, schedule_id, is_competent, year } = req.query; // <- Tambahkan year
    const filters = {
        occupation_id: occupation_id ? Number(occupation_id) : undefined,
        scheme_id: scheme_id ? Number(scheme_id) : undefined,
        schedule_id: schedule_id ? Number(schedule_id) : undefined,
        is_competent: is_competent !== undefined ? is_competent === 'true' || is_competent === '1' : undefined,
        year: year ? Number(year) : undefined, // <- Tambahkan ini
    };
    const buffer = yield asseessee_service_1.AssesseeService.exportAssesseesToExcel(filters);
    const yearLabel = filters.year ? `-${filters.year}` : '';
    const filename = `data-asesi${yearLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
}));
