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
exports.IAO2Service = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class IAO2Service {
    static getIA02Groups(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield db_1.prisma.assessment.findUnique({
                where: { id: assessmentId }
            });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const groups = yield db_1.prisma.group_ia02.findMany({
                where: {
                    assessment_id: assessmentId
                },
                include: {
                    units: true,
                    tools: true
                }
            });
            return groups;
        });
    }
    static approveByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ia02_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia02_headers) {
                throw new error_1.NotFoundError('IA02 header');
            }
            const headerId = existingResult.ia02_headers.id;
            const update = yield db_1.prisma.result_ia02_header.update({
                where: { id: headerId },
                data: {
                    approved_assessor: true,
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
                    id: update.result.assessee.id,
                    name: update.result.assessee.user.full_name,
                    email: update.result.assessee.user.email
                },
                approved_assessee: update.approved_assessee,
                approved_assessor: update.approved_assessor,
            };
        });
    }
    static approveByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ia02_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia02_headers) {
                throw new error_1.NotFoundError('IA02 header');
            }
            const headerId = existingResult.ia02_headers.id;
            const update = yield db_1.prisma.result_ia02_header.update({
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
                    id: update.result.assessee.id,
                    name: update.result.assessee.user.full_name,
                    email: update.result.assessee.user.email
                },
                approved_assessee: update.approved_assessee,
                approved_assessor: update.approved_assessor,
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
                    ia02_headers: true
                }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            if (!result.ia02_headers) {
                throw new error_1.NotFoundError('Result header');
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
                ia02_header: result.ia02_headers
            };
        });
    }
}
exports.IAO2Service = IAO2Service;
