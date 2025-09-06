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
exports.AssessmentService = void 0;
const error_1 = require("../../common/error");
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AssessmentService {
    static createAssessment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield drizzle_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Create occupation
                const [occupation] = yield tx.insert(schema_1.occupation).values({
                    schemeId: data.scheme_id,
                    name: data.occupation_name,
                });
                // Create assessment
                const [assessment] = yield tx.insert(schema_1.assessment).values({
                    occupationId: occupation.insertId,
                    code: data.code,
                });
                const assessmentId = assessment.insertId;
                // Create UC APL02
                for (const uc of data.uc_apl02s) {
                    const [ucApl02] = yield tx.insert(schema_1.ucApl02).values({
                        assessmentId,
                        unitCode: uc.unit_code,
                        title: uc.title,
                    });
                    for (const element of uc.elements) {
                        const [elementApl02] = yield tx.insert(schema_1.elementApl02).values({
                            ucId: ucApl02.insertId,
                            title: element.title,
                        });
                        for (const detail of element.details) {
                            yield tx.insert(schema_1.elementDetailsApl02).values({
                                elementId: elementApl02.insertId,
                                description: detail.description,
                            });
                        }
                    }
                }
                // Create Group IA01
                for (const group of data.groups_ia01) {
                    const [groupIa01] = yield tx.insert(schema_1.groupIa01).values({
                        assessmentId,
                        name: group.name,
                    });
                    for (const unit of group.units) {
                        const [ucIa01] = yield tx.insert(schema_1.ucIa01).values({
                            groupId: groupIa01.insertId,
                            unitCode: unit.unit_code,
                            title: unit.title,
                        });
                        for (const element of unit.elements) {
                            const [elementIa] = yield tx.insert(schema_1.elementIa).values({
                                ucId: ucIa01.insertId,
                                title: element.title,
                            });
                            for (const detail of element.details) {
                                yield tx.insert(schema_1.elementDetailsIa).values({
                                    elementId: elementIa.insertId,
                                    description: detail.description,
                                    benchmark: detail.benchmark,
                                });
                            }
                        }
                    }
                }
                // Create Group IA02
                for (const group of data.groups_ia02) {
                    const [groupIa02] = yield tx.insert(schema_1.groupIa02).values({
                        assessmentId,
                        name: group.name,
                        scenario: group.scenario,
                        duration: group.duration,
                    });
                    for (const unit of group.units) {
                        yield tx.insert(schema_1.ucIa02).values({
                            groupId: groupIa02.insertId,
                            unitCode: unit.unit_code,
                            title: unit.title,
                        });
                    }
                    for (const tool of group.tools) {
                        yield tx.insert(schema_1.ia02Tool).values({
                            groupId: groupIa02.insertId,
                            name: tool.name,
                        });
                    }
                }
                // Create Group IA03
                for (const group of data.groups_ia03) {
                    const [groupIa03] = yield tx.insert(schema_1.groupIa03).values({
                        assessmentId,
                        name: group.name,
                    });
                    for (const unit of group.units) {
                        yield tx.insert(schema_1.ucIa03).values({
                            groupId: groupIa03.insertId,
                            unitCode: unit.unit_code,
                            title: unit.title,
                        });
                    }
                    for (const question of group.qa_ia03) {
                        yield tx.insert(schema_1.ia03Question).values({
                            groupId: groupIa03.insertId,
                            question: question.question,
                        });
                    }
                }
                // Create IA05 Questions
                for (const question of data.ia05_questions) {
                    const [ia05Question] = yield tx.insert(schema_1.ia05Question).values({
                        assessmentId,
                        order: question.order,
                        question: question.question,
                    });
                    for (const option of question.options) {
                        yield tx.insert(schema_1.questionOption).values({
                            questionId: ia05Question.insertId,
                            option: option.option,
                            isAnswer: option.is_answer,
                        });
                    }
                }
                // Create IA07 Questions
                for (const question of data.ia07_questions) {
                    yield tx.insert(schema_1.ia07Question).values({
                        assessmentId,
                        question: question.question,
                        answerKey: question.answer_key,
                    });
                }
                return { id: assessmentId };
            }));
        });
    }
    static getAssessments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessments = yield drizzle_1.db.select({
                id: schema_1.assessment.id,
                code: schema_1.assessment.code,
                occupationId: schema_1.assessment.occupationId,
            }).from(schema_1.assessment);
            const result = [];
            for (const assessment of assessments) {
                const [occupation] = yield drizzle_1.db
                    .select()
                    .from(schema_1.occupation)
                    .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId));
                if (!occupation)
                    continue;
                const [scheme] = yield drizzle_1.db
                    .select()
                    .from(schema_1.scheme)
                    .where((0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId));
                result.push({
                    id: assessment.id,
                    code: assessment.code,
                    occupation: {
                        id: occupation.id,
                        name: occupation.name,
                        scheme: scheme
                            ? {
                                id: scheme.id,
                                code: scheme.code,
                                name: scheme.name,
                            }
                            : null,
                    },
                });
            }
            return result;
        });
    }
    static getAssessmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, id)
            });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            // Get occupation and scheme manually (tanpa relations API)
            const [occupation] = yield drizzle_1.db
                .select()
                .from(schema_1.occupation)
                .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId));
            let scheme = null;
            if (occupation) {
                const [sc] = yield drizzle_1.db
                    .select()
                    .from(schema_1.scheme)
                    .where((0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId));
                scheme = sc !== null && sc !== void 0 ? sc : null;
            }
            // Get all related data without complex relations
            const ucApl02s = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessmentId, id));
            const groupsIa01 = yield drizzle_1.db.select().from(schema_1.groupIa01).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.assessmentId, id));
            const groupsIa02 = yield drizzle_1.db.select().from(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.assessmentId, id));
            const groupsIa03 = yield drizzle_1.db.select().from(schema_1.groupIa03).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.assessmentId, id));
            const ia05Questions = yield drizzle_1.db.select().from(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.assessmentId, id));
            const ia07Questions = yield drizzle_1.db.select().from(schema_1.ia07Question).where((0, drizzle_orm_1.eq)(schema_1.ia07Question.assessmentId, id));
            return {
                id: assessment.id,
                code: assessment.code,
                occupation: occupation
                    ? Object.assign(Object.assign({}, occupation), { scheme }) : null,
                uc_apl02s: ucApl02s,
                groups_ia01: groupsIa01,
                groups_ia02: groupsIa02,
                groups_ia03: groupsIa03,
                ia05_questions: ia05Questions,
                ia07_questions: ia07Questions,
            };
        });
    }
    static deleteAssessment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, id) });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment not found');
            }
            yield drizzle_1.db.delete(schema_1.assessment).where((0, drizzle_orm_1.eq)(schema_1.assessment.id, id));
            return { message: 'Assessment deleted successfully' };
        });
    }
    static getAssessmentResultDetails(assessmentId, assessorId, assesseeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessmentId, assessmentId), (0, drizzle_orm_1.eq)(schema_1.result.assessorId, assessorId), (0, drizzle_orm_1.eq)(schema_1.result.assesseeId, assesseeId))
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            return result;
        });
    }
}
exports.AssessmentService = AssessmentService;
