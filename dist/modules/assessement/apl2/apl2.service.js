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
exports.APL2Service = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class APL2Service {
    static createAssessment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield db_1.prisma.assessment.findFirst({
                where: {
                    code: data.code
                }
            });
            if (existingAssessment) {
                throw new error_1.DuplicateEntryError('Assessment code', data.code);
            }
            const occupation = yield db_1.prisma.occupation.findUnique({
                where: {
                    id: data.occupation_id
                }
            });
            if (!occupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            const unitCodes = data.unit_competencies.map(unit => unit.unit_code);
            const existingUnits = yield db_1.prisma.uc_apl02.findMany({
                where: {
                    unit_code: { in: unitCodes }
                }
            });
            if (existingUnits.length > 0) {
                throw new error_1.DuplicateEntryError('Unit competency code', existingUnits[0].unit_code);
            }
            const assessment = yield db_1.prisma.assessment.create({
                data: {
                    occupation_id: data.occupation_id,
                    code: data.code,
                    uc_apl02s: {
                        create: data.unit_competencies.map(unit => ({
                            unit_code: unit.unit_code,
                            title: unit.title,
                            elements: {
                                create: unit.elements.map(element => ({
                                    title: element.title,
                                    details: {
                                        create: element.element_details.map(detail => ({
                                            description: detail.description
                                        }))
                                    }
                                }))
                            }
                        }))
                    }
                },
                include: {
                    occupation: {
                        include: {
                            scheme: true
                        }
                    },
                    uc_apl02s: {
                        include: {
                            elements: {
                                include: {
                                    details: true
                                }
                            }
                        }
                    }
                }
            });
            return formatAssessmentResponse(assessment);
        });
    }
    static getAssessmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield db_1.prisma.assessment.findUnique({
                where: { id },
                include: {
                    occupation: {
                        include: {
                            scheme: true
                        }
                    },
                    unit_competencies: {
                        include: {
                            elements: {
                                include: {
                                    details: true
                                }
                            }
                        }
                    }
                }
            });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            return formatAssessmentResponse(assessment);
        });
    }
    static getAssessments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessments = yield db_1.prisma.assessment.findMany({
                include: {
                    occupation: {
                        include: {
                            scheme: true
                        }
                    },
                    unit_competencies: {
                        include: {
                            elements: {
                                include: {
                                    details: true
                                }
                            }
                        }
                    }
                }
            });
            return assessments.map(formatAssessmentResponse);
        });
    }
    static getUnitCompetenciesByAssessmentCode(assessmentCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield db_1.prisma.assessment.findFirst({
                where: { code: assessmentCode },
                select: { id: true }
            });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const unitCompetencies = yield db_1.prisma.uc_apl02.findMany({
                where: { assessment_id: assessment.id }
            });
            return unitCompetencies.map(unit => {
                return {
                    id: unit.id,
                    unit_code: unit.unit_code,
                    title: unit.title,
                };
            });
        });
    }
    static getElementsByUnitCompetencyCode(unitCompetencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitCompetency = yield db_1.prisma.uc_apl02.findFirst({
                where: { unit_code: unitCompetencyCode },
                select: { id: true }
            });
            if (!unitCompetency) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const elements = yield db_1.prisma.element.findMany({
                where: { unit_competency_id: unitCompetency.id },
                include: {
                    details: true
                }
            });
            return elements.map(element => {
                return {
                    id: element.id,
                    title: element.title,
                    element_details: element.details
                };
            });
        });
    }
}
exports.APL2Service = APL2Service;
function formatAssessmentResponse(assessment) {
    return {
        id: assessment.id,
        code: assessment.code,
        occupation: {
            id: assessment.occupation.id,
            name: assessment.occupation.name,
            scheme: {
                id: assessment.occupation.scheme.id,
                code: assessment.occupation.scheme.code,
                name: assessment.occupation.scheme.name
            }
        },
        unit_competencies: assessment.unit_competencies.map((unit) => ({
            id: unit.id,
            assessment_id: unit.assessment_id,
            unit_code: unit.unit_code,
            title: unit.title,
            elements: unit.elements.map((element) => ({
                id: element.id,
                unit_competency_id: element.unit_competency_id,
                title: element.title,
                element_details: element.details
            }))
        }))
    };
}
