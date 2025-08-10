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
Object.defineProperty(exports, "__esModule", { value: true });
exports.APL2Controller = void 0;
const apl2_service_1 = require("./apl2.service");
class APL2Controller {
    constructor() {
        this.apl2Service = new apl2_service_1.APL2Service();
    }
    createAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessment = yield this.apl2Service.createAssessment(req.body);
                res.status(201).json({
                    success: true,
                    message: 'Asesmen berhasil dibuat',
                    data: assessment,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                });
            }
        });
    }
    getAssessments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessments = yield this.apl2Service.getAssessments();
                if (!assessments || assessments.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tidak ada asesmen yang ditemukan',
                    });
                }
                res.json({
                    success: true,
                    message: 'Asesmen berhasil diambil',
                    data: assessments,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                });
            }
        });
    }
    getAssessmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessment = yield this.apl2Service.getAssessmentById(Number(req.params.id));
                if (!assessment) {
                    return res.status(404).json({
                        success: false,
                        message: `Asesmen dengan ID ${req.params.id} tidak ditemukan`,
                    });
                }
                res.json({
                    success: true,
                    message: 'Asesmen berhasil diambil',
                    data: assessment,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                });
            }
        });
    }
    getUnitCompetenciesByAssessmentId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const unitCompetencies = yield this.apl2Service.getUnitCompetenciesByAssessmentId(Number(req.params.assessmentId));
                if (!unitCompetencies) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tidak ada unit kompetensi yang ditemukan',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Unit kompetensi berhasil diambil',
                    data: unitCompetencies,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                });
            }
        });
    }
    getElementsByUnitCompetencyId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const elements = yield this.apl2Service.getElementsByUnitCompetencyId(Number(req.params.unitCompetencyId));
                if (!elements) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tidak ada elemen yang ditemukan',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Elemen berhasil diambil',
                    data: elements,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                });
            }
        });
    }
}
exports.APL2Controller = APL2Controller;
