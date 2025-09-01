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
exports.APL02Service = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class APL02Service {
    static getUnitsAPL02(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    assessment: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const unitCompetencies = yield db_1.prisma.uc_apl02.findMany({
                where: {
                    assessment_id: existingResult.assessment.id
                },
                include: {
                    elements: {
                        include: {
                            results: {
                                include: {
                                    header: true
                                },
                                where: {
                                    header: {
                                        result_id: resultId
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return unitCompetencies.map(unit => {
                const totalElements = unit.elements.length;
                const completedElements = unit.elements.filter(element => element.results.some(result => result.header.result_id === resultId)).length;
                const finished = totalElements > 0 && completedElements === totalElements;
                return {
                    id: unit.id,
                    unit_code: unit.unit_code,
                    title: unit.title,
                    finished: finished,
                    progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
                    total_elements: totalElements,
                    completed_elements: completedElements
                };
            });
        });
    }
    static getElementsByUnitId(resultId, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUc = yield db_1.prisma.uc_apl02.findUnique({
                where: { id: unitId }
            });
            if (!existingUc) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const elements = yield db_1.prisma.element_apl02.findMany({
                where: { uc_id: unitId },
                include: {
                    details: true,
                    results: {
                        include: {
                            header: true,
                            evidences: true
                        },
                        where: {
                            header: {
                                result_id: resultId
                            }
                        }
                    }
                }
            });
            return elements.map((element) => {
                const result = element.results[0];
                return {
                    id: element.id,
                    uc_id: element.uc_id,
                    title: element.title,
                    details: element.details.map((detail) => {
                        return {
                            id: detail.id,
                            description: detail.description
                        };
                    }),
                    result: result ? {
                        id: result.id,
                        header_id: result.result_apl02_id,
                        element_id: result.element_id,
                        is_competent: result.is_competent,
                        evidences: result.evidences.map(evidence => ({
                            id: evidence.id,
                            evidence: evidence.evidence
                        }))
                    } : null
                };
            });
        });
    }
    static sendResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: Number(data.result_id) },
                include: {
                    apl02_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.apl02_headers) {
                throw new error_1.NotFoundError('APL02 header');
            }
            const headerId = existingResult.apl02_headers.id;
            const elements = data.elements.map(element => Number(element.element_id));
            const existingElements = yield db_1.prisma.element_apl02.findMany({
                where: { id: { in: elements } }
            });
            if (existingElements.length !== elements.length) {
                throw new error_1.NotFoundError('Element');
            }
            const results = yield Promise.all(data.elements.map((element) => __awaiter(this, void 0, void 0, function* () {
                return yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const resultRecord = yield tx.result_apl02.upsert({
                        where: {
                            result_apl02_id_element_id: {
                                result_apl02_id: Number(headerId),
                                element_id: Number(element.element_id)
                            }
                        },
                        update: {
                            is_competent: element.is_competent,
                            updated_at: new Date(),
                            evidences: {
                                deleteMany: {},
                                createMany: {
                                    data: element.evidences.map(evidence => ({
                                        evidence: evidence.evidence
                                    }))
                                }
                            }
                        },
                        create: {
                            result_apl02_id: Number(data.result_id),
                            element_id: Number(element.element_id),
                            is_competent: element.is_competent,
                            evidences: {
                                createMany: {
                                    data: element.evidences.map(evidence => ({
                                        evidence: evidence.evidence
                                    }))
                                }
                            }
                        }
                    });
                    return yield tx.result_apl02.findUnique({
                        where: { id: resultRecord.id },
                        include: { evidences: true }
                    });
                }));
            })));
            return results;
        });
    }
    static getUnitsResult(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findFirst({
                where: {
                    id: resultId
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const unitsResult = yield db_1.prisma.result_apl02_header.findMany({
                where: {
                    result_id: resultId
                },
                include: {
                    result: {
                        include: {
                            assessee: {
                                include: {
                                    user: true
                                }
                            },
                            assessment: {
                                include: {
                                    uc_apl02s: true
                                }
                            }
                        }
                    }
                },
                orderBy: { id: 'desc' },
                take: 1
            });
            if (!unitsResult) {
                throw new error_1.NotFoundError('Units result');
            }
            const unitResult = unitsResult[0];
            return {
                id: unitResult.id,
                result_id: unitResult.result_id,
                assessee: {
                    id: unitResult.result.assessee_id,
                    name: unitResult.result.assessee.user.full_name,
                    email: unitResult.result.assessee.user.email
                },
                approved_assessee: unitResult.approved_assessee,
                approved_assessor: unitResult.approved_assessor,
                is_continue: unitResult.is_continue,
                units: unitResult.result.assessment.uc_apl02s.map(unit => ({
                    id: unit.id,
                    unit_code: unit.unit_code,
                    title: unit.title
                }))
            };
        });
    }
    static getElementsResult(resultId, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUnit = yield db_1.prisma.uc_apl02.findUnique({
                where: { id: unitId }
            });
            if (!existingUnit) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const existingResult = yield db_1.prisma.result.findFirst({
                where: {
                    id: resultId
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const elementsResult = yield db_1.prisma.result_apl02_header.findMany({
                where: {
                    result_id: resultId,
                    rows: {
                        some: {
                            element: {
                                uc_id: unitId
                            }
                        }
                    }
                },
                include: {
                    result: {
                        include: {
                            assessee: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    rows: {
                        include: {
                            element: {
                                include: {
                                    details: true
                                }
                            },
                            evidences: true
                        }
                    }
                },
                orderBy: { id: 'desc' },
                take: 1
            });
            if (!elementsResult) {
                throw new error_1.NotFoundError('Elements result');
            }
            const elementResult = elementsResult[0];
            return {
                id: elementResult.id,
                result_id: elementResult.result_id,
                assessee: {
                    id: elementResult.result.assessee_id,
                    name: elementResult.result.assessee.user.full_name,
                    email: elementResult.result.assessee.user.email
                },
                approved_assessee: elementResult.approved_assessee,
                approved_assessor: elementResult.approved_assessor,
                is_continue: elementResult.is_continue,
                results: elementResult.rows.map(element => ({
                    id: element.id,
                    element: element.element,
                    is_competent: element.is_competent,
                    evidences: element.evidences
                }))
            };
        });
    }
    static approvedByAssessor(resultId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    apl02_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.apl02_headers) {
                throw new error_1.NotFoundError('APL02 header');
            }
            const headerId = existingResult.apl02_headers.id;
            const update = yield db_1.prisma.result_apl02_header.update({
                where: { id: headerId },
                data: {
                    approved_assessor: true,
                    is_continue: data.reccomendation
                },
                include: {
                    result: {
                        include: {
                            assessee: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });
            return {
                id: update.id,
                result_id: update.result_id,
                assessee: {
                    id: update.result.assessee_id,
                    name: update.result.assessee.user.full_name,
                    email: update.result.assessee.user.email
                },
                approved_assessee: update.approved_assessee,
                approved_assessor: update.approved_assessor,
                is_continue: update.is_continue
            };
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    apl02_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.apl02_headers) {
                throw new error_1.NotFoundError('Result header');
            }
            const headerId = existingResult.apl02_headers.id;
            const update = yield db_1.prisma.result_apl02_header.update({
                where: { id: headerId },
                data: {
                    approved_assessee: true,
                },
                include: {
                    result: {
                        include: {
                            assessee: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });
            return {
                id: update.id,
                result_id: update.result_id,
                assessee: {
                    id: update.result.assessee_id,
                    name: update.result.assessee.user.full_name,
                    email: update.result.assessee.user.email
                },
                approved_assessee: update.approved_assessee,
                approved_assessor: update.approved_assessor,
                is_continue: update.is_continue
            };
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true
                                }
                            }
                        }
                    },
                    assessee: {
                        include: {
                            user: true
                        }
                    },
                    assessor: {
                        include: {
                            user: true
                        }
                    },
                    apl02_headers: true,
                    docs: true
                }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            if (!result.apl02_headers) {
                throw new error_1.NotFoundError('Result header');
            }
            if (result.docs.length < 1) {
                throw new error_1.NotFoundError('Result docs');
            }
            return {
                id: result.id,
                assessment: result.assessment,
                assessee: {
                    id: result.assessee.id,
                    name: result.assessee.user.full_name,
                    email: result.assessee.user.email
                },
                assessor: {
                    id: result.assessor.id,
                    name: result.assessor.user.full_name,
                    email: result.assessor.user.email,
                    no_reg_met: result.assessor.no_reg_met
                },
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                apl02_header: result.apl02_headers,
                approved_admin: result.docs[result.docs.length - 1].approved
            };
        });
    }
}
exports.APL02Service = APL02Service;
