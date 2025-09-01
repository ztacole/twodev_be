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
exports.IA05Service = void 0;
const db_1 = require("../../../config/db");
const error_1 = require("../../../common/error");
class IA05Service {
    static getQuestions(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield db_1.prisma.assessment.findUnique({
                where: { id: assessmentId }
            });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const questions = yield db_1.prisma.ia05_question.findMany({
                where: {
                    assessment_id: assessmentId
                },
                orderBy: {
                    order: 'asc'
                },
                include: {
                    options: true
                }
            });
            return questions.map((question) => ({
                id: question.id,
                order: question.order,
                question: question.question,
                options: question.options.map((option) => ({
                    id: option.id,
                    option: option.option,
                }))
            }));
        });
    }
    static getAnswerKeys(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield db_1.prisma.assessment.findUnique({
                where: { id: assessmentId }
            });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const answers = yield db_1.prisma.question_option.findMany({
                where: {
                    question: {
                        assessment_id: assessmentId
                    },
                    is_answer: true
                },
                orderBy: {
                    question: {
                        order: 'asc'
                    }
                },
                include: {
                    question: true
                }
            });
            return answers.map((answer) => ({
                id: answer.question.id,
                order: answer.question.order,
                question: answer.question.question,
                answer: {
                    id: answer.id,
                    option: answer.option
                }
            }));
        });
    }
    static getAssesseeAnswers(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ia05_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia05_headers) {
                throw new error_1.NotFoundError('IA05 header');
            }
            const headerId = existingResult.ia05_headers.id;
            const answers = yield db_1.prisma.result_ia05.findMany({
                where: {
                    header_id: headerId
                },
                include: {
                    option: {
                        include: {
                            question: true
                        }
                    },
                }
            });
            return answers.map((answer) => ({
                id: answer.option.question.id,
                order: answer.option.question.order,
                question: answer.option.question.question,
                answers: {
                    id: answer.option.id,
                    option: answer.option.option,
                    approved: answer.approved
                }
            }));
        });
    }
    static sendAssesseeResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: data.result_id },
                include: {
                    ia05_headers: {
                        include: {
                            rows: {
                                include: {
                                    option: true
                                }
                            }
                        }
                    }
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia05_headers) {
                throw new error_1.NotFoundError('IA05 header');
            }
            const headerId = existingResult.ia05_headers.id;
            const existingRows = existingResult.ia05_headers.rows;
            const optionIds = data.answers.map(answer => Number(answer.option_id));
            const existingOptions = yield db_1.prisma.question_option.findMany({
                where: { id: { in: optionIds } },
                include: {
                    question: true
                }
            });
            if (existingOptions.length !== optionIds.length) {
                throw new error_1.NotFoundError('Option');
            }
            const results = yield Promise.all(data.answers.map((answer) => __awaiter(this, void 0, void 0, function* () {
                const selectedOption = existingOptions.find(opt => opt.id === answer.option_id);
                if (!selectedOption) {
                    throw new error_1.NotFoundError(`Option ${answer.option_id}`);
                }
                const existingRow = existingRows.find(row => row.option.question_id === selectedOption.question_id);
                if (existingRow) {
                    return yield db_1.prisma.result_ia05.update({
                        where: {
                            id: existingRow.id
                        },
                        data: {
                            option_id: answer.option_id,
                            updated_at: new Date()
                        }
                    });
                }
                else {
                    return yield db_1.prisma.result_ia05.create({
                        data: {
                            header_id: headerId,
                            option_id: answer.option_id,
                            approved: false
                        }
                    });
                }
            })));
            return results;
        });
    }
    static sendAssessorResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: data.result_id },
                include: {
                    ia05_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia05_headers) {
                throw new error_1.NotFoundError('IA05 header');
            }
            const headerId = existingResult.ia05_headers.id;
            const optionIds = data.results.map(option => option.option_id);
            const existingOptions = yield db_1.prisma.result_ia05.findMany({
                where: { id: { in: optionIds } }
            });
            if (existingOptions.length !== optionIds.length) {
                throw new error_1.NotFoundError('Option');
            }
            const updateHeader = yield db_1.prisma.result_ia05_header.update({
                where: { id: headerId },
                data: {
                    is_achieved: data.is_achieved,
                    unit: data.unit,
                    element: data.element,
                    kuk: data.kuk,
                    updated_at: new Date()
                },
                include: {
                    rows: true
                }
            });
            const results = yield Promise.all(data.results.map((result) => __awaiter(this, void 0, void 0, function* () {
                const update = yield db_1.prisma.result_ia05.update({
                    where: {
                        header_id_option_id: {
                            header_id: headerId,
                            option_id: result.option_id
                        }
                    },
                    data: {
                        approved: result.approved,
                        updated_at: new Date()
                    }
                });
                return update;
            })));
            return updateHeader;
        });
    }
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ia05_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia05_headers) {
                throw new error_1.NotFoundError('IA05 header');
            }
            const headerId = existingResult.ia05_headers.id;
            const update = yield db_1.prisma.result_ia05_header.update({
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
                id: update.result.id,
                result_id: update.result.id,
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
                    ia05_headers: true
                }
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ia05_headers) {
                throw new error_1.NotFoundError('IA05 header');
            }
            const headerId = existingResult.ia05_headers.id;
            const update = yield db_1.prisma.result_ia05_header.update({
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
                id: update.result.id,
                result_id: update.result.id,
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
                    ia05_headers: true
                }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            if (!result.ia05_headers) {
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
                ia05_header: result.ia05_headers
            };
        });
    }
}
exports.IA05Service = IA05Service;
