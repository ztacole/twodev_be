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
exports.IA03Service = void 0;
const db_1 = require("../../../config/db");
const error_1 = require("../../../common/error");
class IA03Service {
    static getIA03Groups(resultId) {
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
            const groups = yield db_1.prisma.group_ia03.findMany({
                where: {
                    assessment_id: existingResult.assessment_id
                },
                include: {
                    units: true,
                    qa_ia03: {
                        include: {
                            rows: {
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
            return groups.map((group) => ({
                id: group.id,
                assessment_id: group.assessment_id,
                name: group.name,
                units: group.units,
                questions: group.qa_ia03.map((question) => ({
                    id: question.id,
                    question: question.question,
                    result: question.rows[0] ? {
                        id: question.rows[0].id,
                        header_id: question.rows[0].header_id,
                        answer: question.rows[0].answer,
                        approved: question.rows[0].approved
                    } : null
                }))
            }));
        });
    }
    static sendResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: data.result_id },
                include: {
                    ia03_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia03_headers) {
                throw new error_1.NotFoundError('IA03 header');
            }
            const headerId = existingResult.ia03_headers.id;
            const questions = data.questions.map(question => Number(question.question_id));
            const existingQuestions = yield db_1.prisma.ia03_question.findMany({
                where: { id: { in: questions } }
            });
            if (existingQuestions.length !== questions.length) {
                throw new error_1.NotFoundError('Question');
            }
            const results = yield Promise.all(data.questions.map((question) => __awaiter(this, void 0, void 0, function* () {
                return yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const resultRecord = yield tx.result_ia03.upsert({
                        where: {
                            header_id_question_id: {
                                header_id: headerId,
                                question_id: question.question_id
                            }
                        },
                        update: {
                            answer: question.answer,
                            approved: question.approved
                        },
                        create: {
                            header_id: headerId,
                            question_id: question.question_id,
                            answer: question.answer,
                            approved: question.approved
                        }
                    });
                    return resultRecord;
                }));
            })));
            return results;
        });
    }
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ia03_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia03_headers) {
                throw new error_1.NotFoundError('IA03 header');
            }
            const headerId = existingResult.ia03_headers.id;
            const update = yield db_1.prisma.result_ia03_header.update({
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
                approved_assessor: update.approved_assessor
            };
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ia03_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia03_headers) {
                throw new error_1.NotFoundError('IA03 header');
            }
            const headerId = existingResult.ia03_headers.id;
            const update = yield db_1.prisma.result_ia03_header.update({
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
                approved_assessor: update.approved_assessor
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
                    ia03_headers: true
                }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            if (!result.ia03_headers) {
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
                ia03_header: result.ia03_headers
            };
        });
    }
}
exports.IA03Service = IA03Service;
