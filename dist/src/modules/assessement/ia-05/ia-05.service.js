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
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class IA05Service {
    static getQuestions(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!existingAssessment)
                throw new error_1.NotFoundError('Assessment');
            const questions = yield drizzle_1.db.select().from(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id)).orderBy(schema_1.ia05Question.order);
            return Promise.all(questions.map((q) => __awaiter(this, void 0, void 0, function* () {
                const options = yield drizzle_1.db.select().from(schema_1.questionOption).where((0, drizzle_orm_1.eq)(schema_1.questionOption.question_id, q.id));
                return {
                    id: q.id,
                    order: q.order,
                    question: q.question,
                    options: options.map(o => ({ id: o.id, option: o.option }))
                };
            })));
        });
    }
    static getAnswerKeys(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!existingAssessment)
                throw new error_1.NotFoundError('Assessment');
            const questions = yield drizzle_1.db.select().from(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id)).orderBy(schema_1.ia05Question.order);
            return Promise.all(questions.map((q) => __awaiter(this, void 0, void 0, function* () {
                const answer = yield drizzle_1.db.query.questionOption.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.questionOption.question_id, q.id), (0, drizzle_orm_1.eq)(schema_1.questionOption.is_answer, true)) });
                return {
                    id: q.id,
                    order: q.order,
                    question: q.question,
                    answer: answer ? { id: answer.id, option: answer.option } : undefined
                };
            })));
        });
    }
    static getAssesseeAnswers(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id), });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA05 header');
            const answers = yield drizzle_1.db.select().from(schema_1.resultIa05).where((0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, header.id));
            const mapped = [];
            for (const row of answers) {
                const option = yield drizzle_1.db.query.questionOption.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.questionOption.id, row.option_id) });
                if (!option)
                    continue;
                const question = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.id, option.question_id) });
                if (!question)
                    continue;
                mapped.push({
                    id: question.id,
                    order: question.order,
                    question: question.question,
                    answers: { id: option.id, option: option.option, approved: row.approved }
                });
            }
            return mapped;
        });
    }
    static sendAssesseeResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA05 header');
            const option_ids = data.answers.map(a => Number(a.option_id));
            const options = option_ids.length ? yield drizzle_1.db.select().from(schema_1.questionOption).where((0, drizzle_orm_1.inArray)(schema_1.questionOption.id, option_ids)) : [];
            if (options.length !== option_ids.length)
                throw new error_1.NotFoundError('Option');
            const existingRows = yield drizzle_1.db.select().from(schema_1.resultIa05).where((0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, header.id));
            const results = [];
            for (const answer of data.answers) {
                const selected = options.find(o => o.id === answer.option_id);
                if (!selected)
                    throw new error_1.NotFoundError(`Option ${answer.option_id}`);
                // Find existing row by question (through option)
                let existingForQuestion = null;
                for (const r of existingRows) {
                    const opt = yield drizzle_1.db.query.questionOption.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.questionOption.id, r.option_id) });
                    if (opt && opt.question_id === selected.question_id) {
                        existingForQuestion = r.id;
                        break;
                    }
                }
                if (existingForQuestion) {
                    yield drizzle_1.db.update(schema_1.resultIa05).set({ option_id: answer.option_id }).where((0, drizzle_orm_1.eq)(schema_1.resultIa05.id, existingForQuestion));
                    const updated = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05.id, existingForQuestion) });
                    if (updated)
                        results.push(updated);
                }
                else {
                    yield drizzle_1.db.insert(schema_1.resultIa05).values({ header_id: header.id, option_id: answer.option_id, approved: false });
                    const created = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultIa05.option_id, answer.option_id)) });
                    if (created)
                        results.push(created);
                }
            }
            return results;
        });
    }
    static sendAssessorResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA05 header');
            yield drizzle_1.db.update(schema_1.resultIa05Header).set({
                is_achieved: data.is_achieved,
                unit: data.unit,
                element: data.element,
                kuk: data.kuk,
            }).where((0, drizzle_orm_1.eq)(schema_1.resultIa05Header.id, header.id));
            const results = [];
            for (const r of data.results) {
                const row = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultIa05.option_id, r.option_id)) });
                if (row) {
                    yield drizzle_1.db.update(schema_1.resultIa05).set({ approved: r.approved }).where((0, drizzle_orm_1.eq)(schema_1.resultIa05.id, row.id));
                    const updated = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05.id, row.id) });
                    if (updated)
                        results.push(updated);
                }
            }
            const updatedHeader = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.id, header.id) });
            return updatedHeader;
        });
    }
    static approvedByAssessor(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA05 header');
            yield drizzle_1.db.update(schema_1.resultIa05Header).set({ approved_assessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa05Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA05 header');
            return updated;
        });
    }
    static approvedByAssessee(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA05 header');
            yield drizzle_1.db.update(schema_1.resultIa05Header).set({ approved_assessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa05Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA05 header');
            return updated;
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result.id) });
            if (!header)
                throw new error_1.NotFoundError('Result header');
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                ia05_header: header,
            };
        });
    }
}
exports.IA05Service = IA05Service;
