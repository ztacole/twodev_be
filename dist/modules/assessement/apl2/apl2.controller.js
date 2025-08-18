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
exports.APL2Controller = void 0;
const apl2_service_1 = require("./apl2.service");
const async_handler_1 = require("../../../common/async.handler");
class APL2Controller {
}
exports.APL2Controller = APL2Controller;
_a = APL2Controller;
APL2Controller.createAssessment = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate data
    if (!req.body.occupation_id || !req.body.code || !req.body.unit_competencies || !req.body.unit_competencies.length) {
        return res.status(400).json({
            success: false,
            message: 'Data asesmen tidak lengkap',
        });
    }
    req.body.unit_competencies.forEach((unitCompetency) => {
        if (!unitCompetency.unit_code || !unitCompetency.title || !unitCompetency.elements || !unitCompetency.elements.length) {
            return res.status(400).json({
                success: false,
                message: 'Data unit kompetensi tidak lengkap',
            });
        }
        unitCompetency.elements.forEach((element) => {
            if (!element.title || !element.element_details || !element.element_details.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Data elemen tidak lengkap',
                });
            }
            element.element_details.forEach((detail) => {
                if (!detail.description) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data indikator tidak lengkap',
                    });
                }
            });
        });
    });
    // Create assessment
    const assessment = yield apl2_service_1.APL2Service.createAssessment(req.body);
    res.status(201).json({
        success: true,
        message: 'Asesmen berhasil dibuat',
        data: assessment,
    });
}));
APL2Controller.getAssessments = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessments = yield apl2_service_1.APL2Service.getAssessments();
    res.json({
        success: true,
        message: 'Asesmen berhasil diambil',
        data: assessments,
    });
}));
APL2Controller.getAssessmentById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessment = yield apl2_service_1.APL2Service.getAssessmentById(Number(req.params.id));
    res.json({
        success: true,
        message: 'Asesmen berhasil diambil',
        data: assessment,
    });
}));
APL2Controller.getUnitCompetenciesByAssessmentId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const unitCompetencies = yield apl2_service_1.APL2Service.getUnitCompetenciesByAssessmentCode(req.params.assessmentCode);
    res.status(200).json({
        success: true,
        message: 'Unit kompetensi berhasil diambil',
        data: unitCompetencies,
    });
}));
APL2Controller.getElementsByUnitCompetencyId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const elements = yield apl2_service_1.APL2Service.getElementsByUnitCompetencyCode(req.params.unitCompetencyCode);
    res.status(200).json({
        success: true,
        message: 'Elemen berhasil diambil',
        data: elements,
    });
}));
