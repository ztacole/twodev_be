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
            // Check if scheme exists
            const existingScheme = yield drizzle_1.db.query.scheme.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, data.scheme_id)
            });
            if (!existingScheme) {
                throw new error_1.NotFoundError("Scheme");
            }
            // Check for duplicate assessment code
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessment.code, data.code)
            });
            if (existingAssessment) {
                throw new error_1.DuplicateEntryError("Assessment code", data.code);
            }
            // Find or create occupation
            let existingOccupation = yield drizzle_1.db.query.occupation.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.occupation.name, data.occupation_name), (0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, data.scheme_id))
            });
            if (!existingOccupation) {
                const [createdOccupation] = yield drizzle_1.db.insert(schema_1.occupation).values({
                    name: data.occupation_name,
                    scheme_id: data.scheme_id
                }).$returningId();
                existingOccupation = yield drizzle_1.db.query.occupation.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, createdOccupation.id)
                });
            }
            return yield drizzle_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Create occupation
                const [occupation] = yield tx.insert(schema_1.occupation).values({
                    scheme_id: data.scheme_id,
                    name: data.occupation_name,
                });
                // Create assessment
                const [assessment] = yield tx.insert(schema_1.assessment).values({
                    occupation_id: occupation.insertId,
                    code: data.code,
                });
                const assessment_id = assessment.insertId;
                // Create UC APL02
                for (const uc of data.uc_apl02s) {
                    const [ucApl02] = yield tx.insert(schema_1.ucApl02).values({
                        assessment_id,
                        unit_code: uc.unit_code,
                        title: uc.title,
                    });
                    for (const element of uc.elements) {
                        const [elementApl02] = yield tx.insert(schema_1.elementApl02).values({
                            uc_id: ucApl02.insertId,
                            title: element.title,
                        });
                        for (const detail of element.details) {
                            yield tx.insert(schema_1.elementDetailsApl02).values({
                                element_id: elementApl02.insertId,
                                description: detail.description,
                            });
                        }
                    }
                }
                // Create Group IA01
                for (const group of data.groups_ia01) {
                    const [groupIa01] = yield tx.insert(schema_1.groupIa01).values({
                        assessment_id,
                        name: group.name,
                    });
                    for (const unit of group.units) {
                        const [ucIa01] = yield tx.insert(schema_1.ucIa01).values({
                            group_id: groupIa01.insertId,
                            unit_code: unit.unit_code,
                            title: unit.title,
                        });
                        for (const element of unit.elements) {
                            const [elementIa] = yield tx.insert(schema_1.elementIa).values({
                                uc_id: ucIa01.insertId,
                                title: element.title,
                            });
                            for (const detail of element.details) {
                                yield tx.insert(schema_1.elementDetailsIa).values({
                                    element_id: elementIa.insertId,
                                    description: detail.description,
                                    benchmark: detail.benchmark,
                                });
                            }
                        }
                    }
                }
                // Create Group IA03
                for (const group of data.groups_ia03) {
                    const [groupIa03] = yield tx.insert(schema_1.groupIa03).values({
                        assessment_id,
                        name: group.name,
                    });
                    for (const unit of group.units) {
                        yield tx.insert(schema_1.ucIa03).values({
                            group_id: groupIa03.insertId,
                            unit_code: unit.unit_code,
                            title: unit.title,
                        });
                    }
                    for (const question of group.qa_ia03) {
                        yield tx.insert(schema_1.ia03Question).values({
                            group_id: groupIa03.insertId,
                            question: question.question,
                        });
                    }
                }
                // Create IA05 Questions
                if (data.ia05_questions && data.ia05_questions.length > 0) {
                    for (const question of data.ia05_questions) {
                        const [ia05Question] = yield tx.insert(schema_1.ia05Question).values({
                            assessment_id,
                            order: question.order,
                            question: question.question,
                        });
                        for (const option of question.options) {
                            yield tx.insert(schema_1.questionOption).values({
                                question_id: ia05Question.insertId,
                                option: option.option,
                                is_answer: option.is_answer,
                            });
                        }
                    }
                }
                // Create IA07 Questions
                if (data.ia07_questions && data.ia07_questions.length > 0) {
                    for (const question of data.ia07_questions) {
                        yield tx.insert(schema_1.ia07Question).values({
                            assessment_id,
                            question: question.question,
                            answer_key: question.answer_key,
                        });
                    }
                }
                return { id: assessment_id };
            }));
        });
    }
    static getAssessments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessments = yield drizzle_1.db.select({
                id: schema_1.assessment.id,
                code: schema_1.assessment.code,
                occupation_id: schema_1.assessment.occupation_id,
            }).from(schema_1.assessment);
            const result = [];
            for (const assessment of assessments) {
                const [occupation] = yield drizzle_1.db
                    .select()
                    .from(schema_1.occupation)
                    .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id));
                if (!occupation)
                    continue;
                const [scheme] = yield drizzle_1.db
                    .select()
                    .from(schema_1.scheme)
                    .where((0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id));
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
                .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id));
            let scheme = null;
            if (occupation) {
                const [sc] = yield drizzle_1.db
                    .select()
                    .from(schema_1.scheme)
                    .where((0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id));
                scheme = sc !== null && sc !== void 0 ? sc : null;
            }
            // Get all related data without complex relations
            const ucApl02s = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, id));
            const groupsIa01 = yield drizzle_1.db.select().from(schema_1.groupIa01).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.assessment_id, id));
            const groupsIa02 = yield drizzle_1.db.select().from(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.assessment_id, id));
            const groupsIa03 = yield drizzle_1.db.select().from(schema_1.groupIa03).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, id));
            const ia05Questions = yield drizzle_1.db.select().from(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, id));
            const ia07Questions = yield drizzle_1.db.select().from(schema_1.ia07Question).where((0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, id));
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
    static getAssessmentResultDetails(assessment_id, assessor_id, assessee_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db
                .select({
                id: schema_1.result.id,
                assessment: schema_1.assessment,
                assessee: schema_1.assessee,
                assessor: schema_1.assessor,
                tuk: schema_1.result.tuk,
                is_competent: schema_1.result.is_competent,
                created_at: schema_1.result.created_at,
            })
                .from(schema_1.result)
                .innerJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schema_1.assessment.id))
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .innerJoin(schema_1.assessor, (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.assessor.id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.assessee.id, assessee_id)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.result.created_at))
                .limit(1);
            if (results.length === 0) {
                throw new error_1.NotFoundError('Result');
            }
            const result = results[0];
            const doc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result.id) });
            const apl02Header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result.id) });
            const ia01Header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result.id) });
            const ia02Header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result.id) });
            const ia03Header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result.id) });
            const ia05Header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result.id) });
            const ak01Header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, result.id) });
            const ak02Header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result.id) });
            const ak03Header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.id, result.id) });
            const ak04 = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, result.id) });
            const ak05 = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.id, result.id) });
            return [
                {
                    id: result.id,
                    assessment: result.assessment,
                    assessee: result.assessee,
                    assessor: result.assessor,
                    tuk: result.tuk,
                    is_competent: result.is_competent,
                    created_at: result.created_at,
                    doc: doc,
                    apl02_header: apl02Header,
                    ia01_header: ia01Header,
                    ia02_header: ia02Header,
                    ia03_header: ia03Header,
                    ia05_header: ia05Header,
                    ak01_header: ak01Header,
                    ak02_header: ak02Header,
                    ak03_header: ak03Header,
                    ak04: ak04,
                    ak05: ak05
                }
            ];
        });
    }
    static findAssesseeByUserId(assessment_id, assessor_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessees = yield drizzle_1.db.query.assessee.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user_id), orderBy: (0, drizzle_orm_1.desc)(schema_1.assessee.created_at) });
            let result;
            for (const assesseeItem of assessees) {
                const results = yield drizzle_1.db.query.result.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assesseeItem.id)),
                    limit: 1,
                    orderBy: (0, drizzle_orm_1.desc)(schema_1.result.created_at)
                });
                if (results.length > 0) {
                    result = results[0];
                    break;
                }
            }
            if (!result)
                return 0;
            return result.assessee_id;
        });
    }
    static assesseeNavigation(assessment_id, assessor_id, assessee_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.select().from(schema_1.result)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessee_id)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.result.created_at))
                .limit(1);
            if (result.length === 0 || !result[0])
                throw new error_1.NotFoundError('Result');
            const doc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result[0].id) });
            if (!doc)
                throw new error_1.NotFoundError('Result Document');
            const apl02Header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result[0].id) });
            if (!apl02Header)
                throw new error_1.NotFoundError('Result APL02 Header');
            const tabs = ['APL-01', 'Data Sertifikasi', 'APL-02', 'AK-04', 'AK-01'];
            const isAnyIa01 = yield drizzle_1.db.query.groupIa01.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa01.assessment_id, assessment_id) });
            const isAnyIa02 = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, assessment_id) });
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id) });
            const isAnyIa07 = yield drizzle_1.db.query.ia07Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, assessment_id) });
            if (isAnyIa01)
                tabs.push('IA-01');
            if (isAnyIa02)
                tabs.push('IA-02');
            if (isAnyIa03)
                tabs.push('IA-03');
            if (isAnyIa05)
                tabs.push('IA-05');
            if (isAnyIa07)
                tabs.push('IA-07');
            tabs.push('AK-02', 'AK-03', 'AK-05');
            const enableOtherRoute = (doc.approved && (apl02Header.approved_assessor && apl02Header.is_continue));
            return {
                result_id: result[0].id,
                assessment_id: result[0].assessment_id,
                assessor_id: result[0].assessor_id,
                assessee_id: result[0].assessee_id,
                tuk: result[0].tuk,
                is_competent: result[0].is_competent,
                created_at: result[0].created_at,
                tabs: tabs,
                enable_other_route: enableOtherRoute,
            };
        });
    }
    static assessorNavigation(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const tabs = ['APL-01', 'APL-02', 'AK-01'];
            const isAnyIa01 = yield drizzle_1.db.query.groupIa01.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa01.assessment_id, assessment_id) });
            const isAnyIa02 = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, assessment_id) });
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id) });
            const isAnyIa07 = yield drizzle_1.db.query.ia07Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, assessment_id) });
            if (isAnyIa01)
                tabs.push('IA-01');
            if (isAnyIa02)
                tabs.push('IA-02');
            if (isAnyIa03)
                tabs.push('IA-03');
            if (isAnyIa05)
                tabs.push('IA-05');
            if (isAnyIa07)
                tabs.push('IA-07');
            tabs.push('AK-02', 'AK-03', 'AK-05');
            return {
                assessment_id: assessment.id,
                assessment_code: assessment.code,
                tabs: tabs,
            };
        });
    }
}
exports.AssessmentService = AssessmentService;
