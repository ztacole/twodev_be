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
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class IA03Service {
    static getIA03Groups(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id), });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, existingResult.assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const groups = yield drizzle_1.db.select().from(schema_1.groupIa03).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, assessment.id));
            return Promise.all(groups.map((g) => __awaiter(this, void 0, void 0, function* () {
                const units = yield drizzle_1.db.select().from(schema_1.ucIa03).where((0, drizzle_orm_1.eq)(schema_1.ucIa03.group_id, g.id));
                const questions = yield drizzle_1.db.select().from(schema_1.ia03Question).where((0, drizzle_orm_1.eq)(schema_1.ia03Question.group_id, g.id));
                const header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result_id) });
                const rows = header ? yield drizzle_1.db.select().from(schema_1.resultIa03).where((0, drizzle_orm_1.eq)(schema_1.resultIa03.header_id, header.id)) : [];
                return {
                    id: g.id,
                    assessment_id: g.assessment_id,
                    name: g.name,
                    units,
                    questions: questions.map(q => ({
                        id: q.id,
                        question: q.question,
                        result: rows.find(r => r.question_id === q.id) ? {
                            id: rows.find(r => r.question_id === q.id).id,
                            header_id: header === null || header === void 0 ? void 0 : header.id,
                            answer: rows.find(r => r.question_id === q.id).answer,
                            approved: rows.find(r => r.question_id === q.id).approved,
                        } : null
                    }))
                };
            })));
        });
    }
    static sendResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA03 header');
            const question_ids = data.questions.map(q => Number(q.question_id));
            const existingQuestions = question_ids.length ? yield drizzle_1.db.select().from(schema_1.ia03Question).where((0, drizzle_orm_1.inArray)(schema_1.ia03Question.id, question_ids)) : [];
            if (existingQuestions.length !== question_ids.length)
                throw new error_1.NotFoundError('Question');
            const results = [];
            for (const q of data.questions) {
                const existing = yield drizzle_1.db.query.resultIa03.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa03.header_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultIa03.question_id, Number(q.question_id))) });
                if (existing) {
                    yield drizzle_1.db.update(schema_1.resultIa03).set({ answer: q.answer, approved: q.approved }).where((0, drizzle_orm_1.eq)(schema_1.resultIa03.id, existing.id));
                    const updated = yield drizzle_1.db.query.resultIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03.id, existing.id) });
                    if (updated)
                        results.push(updated);
                }
                else {
                    yield drizzle_1.db.insert(schema_1.resultIa03).values({ header_id: header.id, question_id: Number(q.question_id), answer: q.answer, approved: q.approved });
                    const created = yield drizzle_1.db.query.resultIa03.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa03.header_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultIa03.question_id, Number(q.question_id))) });
                    if (created)
                        results.push(created);
                }
            }
            return results;
        });
    }
    static approvedByAssessor(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA03 header');
            yield drizzle_1.db.update(schema_1.resultIa03Header).set({ approved_assessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa03Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA03 header');
            return updated;
        });
    }
    static approvedByAssessee(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA03 header');
            yield drizzle_1.db.update(schema_1.resultIa03Header).set({ approved_assessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa03Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA03 header');
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
            const header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result.id) });
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
                ia03_header: header,
            };
        });
    }
}
exports.IA03Service = IA03Service;
