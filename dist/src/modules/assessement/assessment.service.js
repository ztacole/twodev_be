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
const pdf_lib_1 = require("pdf-lib");
const pdfAssets_helper_1 = require("../../helper/pdfAssets.helper");
const pdfDraw_helper_1 = require("../../helper/pdfDraw.helper");
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
            if (isAnyIa02)
                tabs.push('IA-02');
            if (isAnyIa01)
                tabs.push('IA-01');
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
    static assessorNavigation(assessment_id, assessor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const tabs = [
                { name: 'APL-02', status: "Not Started" },
                { name: 'AK-01', status: "Not Started" },
                { name: 'IA-02', status: "Not Started" },
                { name: 'IA-01', status: "Not Started" }
            ];
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id) });
            const isAnyIa07 = yield drizzle_1.db.query.ia07Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, assessment_id) });
            if (isAnyIa03)
                tabs.push({ name: 'IA-03', status: "Not Started" });
            if (isAnyIa05)
                tabs.push({ name: 'IA-05', status: "Not Started" });
            if (isAnyIa07)
                tabs.push({ name: 'IA-07', status: "Not Started" });
            tabs.push({ name: 'AK-02', status: "Not Started" }, { name: 'AK-03', status: "Not Started" }, { name: 'AK-05', status: "Not Started" });
            const results = yield drizzle_1.db.select().from(schema_1.result)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id)));
            if (results.length === 0) {
                return {
                    assessment_id: assessment.id,
                    assessment_code: assessment.code,
                    tabs: tabs,
                };
            }
            // Config header dan tab
            const headerConfigs = [
                { name: 'APL-02', findFirst: (args) => drizzle_1.db.query.resultApl02Header.findFirst(args), col: schema_1.resultApl02Header, notYet: 0, waiting: 0 },
                { name: 'IA-01', findFirst: (args) => drizzle_1.db.query.resultIa01Header.findFirst(args), col: schema_1.resultIa01Header, notYet: 0, waiting: 0 },
                { name: 'IA-02', findFirst: (args) => drizzle_1.db.query.resultIa02Header.findFirst(args), col: schema_1.resultIa02Header, notYet: 0, waiting: 0 },
                { name: 'IA-03', findFirst: (args) => drizzle_1.db.query.resultIa03Header.findFirst(args), col: schema_1.resultIa03Header, notYet: 0, waiting: 0, isSpecial: true },
                { name: 'IA-05', findFirst: (args) => drizzle_1.db.query.resultIa05Header.findFirst(args), col: schema_1.resultIa05Header, notYet: 0, waiting: 0 },
                { name: 'IA-07', findFirst: (args) => drizzle_1.db.query.resultIa07Header.findFirst(args), col: schema_1.resultIa07Header, notYet: 0, waiting: 0 },
                { name: 'AK-01', findFirst: (args) => drizzle_1.db.query.resultAk01Header.findFirst(args), col: schema_1.resultAk01Header, notYet: 0, waiting: 0 },
                { name: 'AK-02', findFirst: (args) => drizzle_1.db.query.resultAk02Header.findFirst(args), col: schema_1.resultAk02Header, notYet: 0, waiting: 0 },
                { name: 'AK-03', findFirst: (args) => drizzle_1.db.query.resultAk03Header.findFirst(args), col: schema_1.resultAk03Header, notYet: 0, waiting: 0, isSpecial: true },
                { name: 'AK-05', findFirst: (args) => drizzle_1.db.query.resultAk05.findFirst(args), col: schema_1.resultAk05, notYet: 0, waiting: 0, onlyApproved: true },
            ];
            for (const result of results) {
                for (const config of headerConfigs) {
                    let header = yield config.findFirst({ where: (0, drizzle_orm_1.eq)(config.col.result_id, result.id) });
                    if (config.name === 'AK-03') {
                        if (!header)
                            config.notYet++;
                    }
                    else if (config.name === 'AK-05') {
                        if (header && 'approved_assessor' in header && !header.approved_assessor)
                            config.notYet++;
                    }
                    else {
                        if (header) {
                            if ('approved_assessor' in header && !header.approved_assessor)
                                config.notYet++;
                            if ('approved_assessor' in header && 'approved_assessee' in header && header.approved_assessor && !header.approved_assessee)
                                config.waiting++;
                        }
                    }
                }
            }
            // Update status tab
            for (const config of headerConfigs) {
                const tab = tabs.find((tab) => tab.name === config.name);
                if (tab) {
                    tab.status = (config.notYet > 0)
                        ? 'Not Started'
                        : (config.notYet === 0 && config.waiting > 0)
                            ? 'Waiting'
                            : 'Completed';
                }
            }
            return {
                assessment_id: assessment.id,
                assessment_code: assessment.code,
                tabs: tabs,
            };
        });
    }
    static adminNavigation(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const tabs = [
                { name: 'APL-02', status: "Not Started" },
                { name: 'AK-01', status: "Not Started" },
                { name: 'IA-02', status: "Not Started" },
                { name: 'IA-01', status: "Not Started" }
            ];
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, result.assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, result.assessment_id) });
            const isAnyIa07 = yield drizzle_1.db.query.ia07Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, result.assessment_id) });
            if (isAnyIa03)
                tabs.push({ name: 'IA-03', status: "Not Started" });
            if (isAnyIa05)
                tabs.push({ name: 'IA-05', status: "Not Started" });
            if (isAnyIa07)
                tabs.push({ name: 'IA-07', status: "Not Started" });
            tabs.push({ name: 'AK-02', status: "Not Started" }, { name: 'AK-03', status: "Not Started" }, { name: 'AK-05', status: "Not Started" });
            // Config header dan tab
            const headerConfigs = [
                { name: 'APL-02', findFirst: (args) => drizzle_1.db.query.resultApl02Header.findFirst(args), col: schema_1.resultApl02Header, notYet: 0, waiting: 0 },
                { name: 'IA-01', findFirst: (args) => drizzle_1.db.query.resultIa01Header.findFirst(args), col: schema_1.resultIa01Header, notYet: 0, waiting: 0 },
                { name: 'IA-02', findFirst: (args) => drizzle_1.db.query.resultIa02Header.findFirst(args), col: schema_1.resultIa02Header, notYet: 0, waiting: 0 },
                { name: 'IA-03', findFirst: (args) => drizzle_1.db.query.resultIa03Header.findFirst(args), col: schema_1.resultIa03Header, notYet: 0, waiting: 0, isSpecial: true },
                { name: 'IA-05', findFirst: (args) => drizzle_1.db.query.resultIa05Header.findFirst(args), col: schema_1.resultIa05Header, notYet: 0, waiting: 0 },
                { name: 'IA-07', findFirst: (args) => drizzle_1.db.query.resultIa07Header.findFirst(args), col: schema_1.resultIa07Header, notYet: 0, waiting: 0 },
                { name: 'AK-01', findFirst: (args) => drizzle_1.db.query.resultAk01Header.findFirst(args), col: schema_1.resultAk01Header, notYet: 0, waiting: 0 },
                { name: 'AK-02', findFirst: (args) => drizzle_1.db.query.resultAk02Header.findFirst(args), col: schema_1.resultAk02Header, notYet: 0, waiting: 0 },
                { name: 'AK-03', findFirst: (args) => drizzle_1.db.query.resultAk03Header.findFirst(args), col: schema_1.resultAk03Header, notYet: 0, waiting: 0, isSpecial: true },
                { name: 'AK-05', findFirst: (args) => drizzle_1.db.query.resultAk05.findFirst(args), col: schema_1.resultAk05, notYet: 0, waiting: 0, onlyApproved: true },
            ];
            for (const config of headerConfigs) {
                let header = yield config.findFirst({ where: (0, drizzle_orm_1.eq)(config.col.result_id, result.id) });
                if (config.name === 'AK-03') {
                    if (!header)
                        config.notYet++;
                }
                else if (config.name === 'AK-05') {
                    if (header && 'approved_assessor' in header && !header.approved_assessor)
                        config.notYet++;
                }
                else {
                    if (header) {
                        if ('approved_assessor' in header && !header.approved_assessor)
                            config.notYet++;
                        if ('approved_assessor' in header && 'approved_assessee' in header && header.approved_assessor && !header.approved_assessee)
                            config.waiting++;
                    }
                }
            }
            // Update status tab
            for (const config of headerConfigs) {
                const tab = tabs.find((tab) => tab.name === config.name);
                if (tab) {
                    tab.status = (config.notYet > 0)
                        ? 'Not Started'
                        : (config.notYet === 0 && config.waiting > 0)
                            ? 'Waiting'
                            : 'Completed';
                }
            }
            return {
                assessment_id: assessment.id,
                assessment_code: assessment.code,
                tabs: tabs,
            };
        });
    }
    static getAssessmentRecapt(schedule_detail_id, assessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduleDetail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, schedule_detail_id), (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.assessor_id, assessor.id)) });
            if (!scheduleDetail)
                throw new error_1.NotFoundError('Schedule Detail');
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, scheduleDetail.schedule_id) });
            if (!schedule)
                throw new error_1.NotFoundError('Assessment Schedule');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const occupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) });
            if (!occupation)
                throw new error_1.NotFoundError('Occupation');
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) });
            if (!scheme)
                throw new error_1.NotFoundError('Scheme');
            const results = yield drizzle_1.db.select({
                id: schema_1.result.id,
                assessment_id: schema_1.result.assessment_id,
                assessor_id: schema_1.result.assessor_id,
                assessee_id: schema_1.result.assessee_id,
                tuk: schema_1.result.tuk,
                is_competent: schema_1.result.is_competent,
            }).from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schedule.assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor.id)));
            let assessees = [];
            let tuk = (results.length > 0 && results[0].tuk) ? results[0].tuk : 'sewaktu';
            let summary = {
                total_assessees: 0,
                total_competent: 0,
                total_incompetent: 0,
                total_ongoing: 0,
            };
            const assessorUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
            if (!assessorUser)
                throw new error_1.NotFoundError('Assessor User');
            for (const res of results) {
                const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, res.assessee_id) });
                if (!assessee)
                    continue;
                const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) });
                // Ambil semua header terkait
                const [resultAPL02, resultIA01, resultIA02, resultIA03, resultIA05, resultIA07, resultAK01, resultAK02, resultAK03, resultAK05] = yield Promise.all([
                    drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa07Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa07Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, res.id) }),
                ]);
                // Penentuan status
                let status = "On Going";
                if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee)
                    status = "Not Competent";
                if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee)
                    status = "Not Competent";
                if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor) &&
                    !resultAK05.is_competent && !res.is_competent)
                    status = "Not Competent";
                if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                    res.is_competent)
                    status = "Competent";
                assessees.push({ id: assessee.id, name: user === null || user === void 0 ? void 0 : user.full_name, status });
                summary.total_assessees++;
                if (status === 'Competent')
                    summary.total_competent++;
                if (status === 'Not Competent')
                    summary.total_incompetent++;
                if (status === 'On Going')
                    summary.total_ongoing++;
            }
            return {
                assessment: {
                    id: assessment.id,
                    code: assessment.code,
                    tuk: tuk,
                    schedule: {
                        id: schedule.id,
                        start_date: schedule.start_date,
                        end_date: schedule.end_date,
                        location: scheduleDetail.location,
                        assessor: {
                            id: assessor.id,
                            full_name: assessorUser.full_name
                        }
                    },
                    assessees: assessees,
                    summary: summary
                }
            };
        });
    }
    static getAssessmentResultsForAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).orderBy((0, drizzle_orm_1.desc)(schema_1.assessmentSchedule.created_at));
            const result = [];
            const now = new Date();
            for (const schedule of schedules) {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
                if (!assessment)
                    continue;
                const occupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) });
                if (!occupation)
                    continue;
                const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) });
                // Status schedule
                let status = '';
                if (schedule.start_date <= now && schedule.end_date >= now) {
                    status = 'Sedang Berjalan';
                }
                else if (schedule.end_date < now) {
                    status = 'Selesai';
                }
                else {
                    status = 'Belum Mulai';
                }
                const details = yield drizzle_1.db.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id));
                const detailList = [];
                for (const detail of details) {
                    const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessor_id) });
                    if (!assessor)
                        continue;
                    const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
                    detailList.push({
                        id: detail.id,
                        location: detail.location,
                        assessor: assessor ? {
                            id: assessor.id,
                            full_name: user === null || user === void 0 ? void 0 : user.full_name,
                            phone_no: assessor.phone_no
                        } : null
                    });
                }
                result.push({
                    id: schedule.id,
                    start_date: schedule.start_date,
                    end_date: schedule.end_date,
                    status,
                    assessment: {
                        id: assessment.id,
                        code: assessment.code,
                        occupation: {
                            id: occupation.id,
                            name: occupation.name,
                            scheme: scheme ? {
                                id: scheme.id,
                                code: scheme.code,
                                name: scheme.name
                            } : null
                        }
                    },
                    schedule_details: detailList
                });
            }
            return result;
        });
    }
    static getAssesseesByAssessmentAndAssessor(assessment_id, assessor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select({
                result_id: schema_1.result.id,
                assessee_id: schema_1.assessee.id,
                full_name: schema_1.user.full_name,
                created_at: schema_1.result.created_at,
            }).from(schema_1.result)
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .innerJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.user.full_name), (0, drizzle_orm_1.asc)(schema_1.result.created_at));
            return results;
        });
    }
    static generateRecaptPDF(assessment) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = assessment.schedule;
            // Format date
            const start = new Date(schedule.start_date);
            const end = new Date(schedule.end_date);
            const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            const months = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            const startDay = days[start.getDay()];
            const startDate = start.getDate();
            const startMonth = months[start.getMonth()];
            const startYear = start.getFullYear();
            const startHour = (`0${start.getHours()}`).slice(-2);
            const startMinute = (`0${start.getMinutes()}`).slice(-2);
            const endHour = (`0${end.getHours()}`).slice(-2);
            const endMinute = (`0${end.getMinutes()}`).slice(-2);
            // === Create a new PDF document ===
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage([612, 936]);
            // === Fonts ===
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const iconFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.ZapfDingbats);
            let y = page.getHeight() - 50;
            const fontSizeSmall = 11;
            const lineGap = 4;
            const lLineGap = 12;
            const xlLineGap = 20;
            // === TITLE ===
            const headerText = [
                "BERITA ACARA",
                "HASIL REKOMENDASI PENILAIAN",
                "UJI KOMPETENSI KEAHLIAN",
            ];
            headerText.forEach(text => {
                y = (0, pdfDraw_helper_1.drawParagraph)(page, text, 40, y, fontBold, fontSizeSmall, "center");
            });
            // === INTRODUCTION PARAGRAPH ===
            const textParts = [
                { text: "Pada hari ini ", font },
                { text: `${startDay}, `, font: fontBold },
                { text: "tanggal ", font },
                { text: `${startDate} `, font: fontBold },
                { text: "bulan ", font },
                { text: `${startMonth} `, font: fontBold },
                { text: "tahun ", font },
                { text: `${startYear}, `, font: fontBold },
                { text: "jam ", font },
                { text: `${startHour}:${startMinute} `, font: fontBold },
                { text: "sampai dengan jam ", font },
                { text: `${endHour}:${endMinute}, `, font: fontBold },
                { text: "bertempat TUK ", font },
                { text: `${assessment.tuk}, `, font: fontBold },
                { text: "ruang ", font },
                { text: `${assessment.schedule.location}, `, font: fontBold },
                { text: "telah dilaksanakan pemberian rekomendasi penilaian terhadap peserta yang namanya tercantum dibawah ini:", font }
            ];
            y = (0, pdfDraw_helper_1.drawMixedParagraph)(page, textParts, 40, y - lLineGap, 12, (0, pdf_lib_1.rgb)(0, 0, 0), 540, 18);
            y -= xlLineGap;
            // === TABLE CONTENT ===
            const tableData = assessment.assessees.map((assessee, index) => ({
                no: index + 1,
                name: assessee.name,
                k: assessee.status === "Competent" ? "✓" : "",
                bk: assessee.status === "Not Competent" ? "✓" : "",
            }));
            const tableTop = y;
            const rowHeight = 25;
            const colWidths = [30, 260, 110, 110];
            const headerColor = (0, pdf_lib_1.rgb)(1, 0.95, 0.7);
            // === TABLE HEADER ===
            let x = 50;
            // Column No
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[0], height: rowHeight * 3,
                color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
            });
            page.drawText("No", { x: x + 8, y: tableTop - rowHeight + 7, size: fontSizeSmall, font: fontBold });
            x += colWidths[0];
            // Column Name
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[1], height: rowHeight * 3,
                color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
            });
            page.drawText("Nama Peserta", { x: x + colWidths[1] / 2 - 47, y: tableTop - rowHeight + 7, size: fontSizeSmall, font: fontBold });
            x += colWidths[1];
            // Kolom Rekomendasi (gabungan K & BK)
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[2] + colWidths[3],
                height: rowHeight * 3,
                color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
            });
            page.drawText("REKOMENDASI", { x: x + (colWidths[2] + colWidths[3]) / 2 - 45, y: tableTop + 7, size: fontSizeSmall, font: fontBold });
            page.drawText("ASISTEN PEMROGRAMAN JUNIOR", { x: x + 15, y: tableTop - rowHeight + 7, size: fontSizeSmall, font: fontBold });
            // Subkolom K
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[2],
                height: rowHeight,
                color: headerColor,
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1
            });
            page.drawText("K", { x: x + colWidths[2] / 2 - 5, y: tableTop - rowHeight * 2 + 7, size: fontSizeSmall, font: fontBold });
            // Subkolom BK
            page.drawRectangle({
                x: x + colWidths[2],
                y: tableTop - rowHeight * 2,
                width: colWidths[3],
                height: rowHeight,
                color: headerColor,
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1
            });
            page.drawText("BK", { x: x + colWidths[2] + colWidths[3] / 2 - 5, y: tableTop - rowHeight * 2 + 7, size: fontSizeSmall, font: fontBold });
            // === TABLE CONTENT ===
            let currentY = tableTop - rowHeight * 3;
            tableData.forEach(row => {
                let x = 50;
                page.drawRectangle({ x, y: currentY, width: colWidths[0], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(String(row.no), { x: x + 8, y: currentY + 7, size: fontSizeSmall, font });
                x += colWidths[0];
                page.drawRectangle({ x, y: currentY, width: colWidths[1], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(row.name, { x: x + 5, y: currentY + 7, size: fontSizeSmall, font });
                x += colWidths[1];
                page.drawRectangle({ x, y: currentY, width: colWidths[2], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(row.k, { x: x + colWidths[2] / 2 - 3, y: currentY + 7, size: fontSizeSmall, font: iconFont });
                x += colWidths[2];
                page.drawRectangle({ x, y: currentY, width: colWidths[3], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(row.bk, { x: x + colWidths[3] / 2 - 3, y: currentY + 7, size: fontSizeSmall, font: iconFont });
                currentY -= rowHeight;
            });
            y = currentY;
            // === NOTE ===
            (0, pdfDraw_helper_1.drawParagraph)(page, "Selama pelaksanaan rekomendasi telah terjadi hal penting sebagai berikut :", 50, y, font, fontSizeSmall);
            const boxSize = 12;
            const boxX = 50;
            let boxY = y - boxSize * 2 + 10 - 6;
            page.drawRectangle({ x: boxX, y: boxY - boxSize + 10, width: boxSize, height: boxSize, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
            (0, pdfDraw_helper_1.drawParagraph)(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY, font, fontSizeSmall);
            boxY -= lineGap;
            page.drawRectangle({ x: boxX, y: boxY - boxSize * 2 + 10, width: boxSize, height: boxSize, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
            (0, pdfDraw_helper_1.drawParagraph)(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY - boxSize, font, fontSizeSmall);
            boxY -= lineGap;
            (0, pdfDraw_helper_1.drawParagraph)(page, "catatan : ...........................................................................................................................................", boxX + boxSize + 5, boxY - boxSize * 2, font, fontSizeSmall);
            (0, pdfDraw_helper_1.drawParagraph)(page, "................................................................................................................................................................", 50, boxY - boxSize * 3, font, fontSizeSmall);
            y = boxY - boxSize * 4;
            (0, pdfDraw_helper_1.drawParagraph)(page, "Demikianlah, berita acara ini dibuat sesuai dengan kejadian yang sebenernya, untuk digunakan sebagaimana mestinya.", 50, y, font, fontSizeSmall);
            // === SIGNATURE ===
            const signatureX = 50;
            let signatureY = y - 50;
            const signatureWidth = 75;
            const assessor_name = assessment.schedule.assessor.full_name;
            (0, pdfDraw_helper_1.drawParagraph)(page, `${startDay + ", " + startDate + " " + startMonth + " " + startYear}`, signatureX, signatureY, font, fontSizeSmall, "right");
            (0, pdfDraw_helper_1.drawParagraph)(page, `${assessor_name}`, signatureX + 20, signatureY - 15, font, fontSizeSmall, "right");
            signatureY -= 20;
            const qrData = "https://www.google.com";
            const qrCode = yield (0, pdfAssets_helper_1.embedQrCode)(pdfDoc, qrData);
            page.drawImage(qrCode, { x: page.getWidth() - signatureWidth * 2, y: signatureY - signatureWidth, width: signatureWidth, height: signatureWidth });
            const pdfBytes = yield pdfDoc.save();
            return pdfBytes;
        });
    }
}
exports.AssessmentService = AssessmentService;
