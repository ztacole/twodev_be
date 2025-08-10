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
                    message: 'Assessment created successfully',
                    data: assessment,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getAssessments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessments = yield this.apl2Service.getAssessments();
                res.json({
                    success: true,
                    message: 'Assessments retrieved successfully',
                    data: assessments,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
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
                        message: 'Assessment not found',
                    });
                }
                res.json({
                    success: true,
                    message: 'Assessment retrieved successfully',
                    data: assessment,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
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
                        message: 'Unit competencies not found',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Unit competencies retrieved successfully',
                    data: unitCompetencies,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
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
                        message: 'Elements not found',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Elements retrieved successfully',
                    data: elements,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.APL2Controller = APL2Controller;
