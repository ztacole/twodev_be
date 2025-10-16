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
exports.AK03Service = void 0;
const drizzle_1 = require("../../../config/drizzle");
const error_1 = require("../../../common/error");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AK03Service {
    static createAK03(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const existingHeader = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, data.result_id) });
            if (existingHeader) {
                throw new Error(`AK-03 with result_id ${data.result_id} already exists`);
            }
            const [created] = yield drizzle_1.db.insert(schema_1.resultAk03Header).values({
                result_id: data.result_id,
                comment: (_a = data.comment) !== null && _a !== void 0 ? _a : null,
            });
            const header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('AK03 Header');
            for (const item of data.items) {
                yield drizzle_1.db.insert(schema_1.resultAk03).values({
                    header_id: header.id,
                    question: item.question,
                    answer: item.answer,
                    comment: (_b = item.comment) !== null && _b !== void 0 ? _b : null,
                });
            }
            const answers = yield drizzle_1.db.query.resultAk03.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03.header_id, header.id) });
            return formatAK03Response(Object.assign(Object.assign({}, header), { answers }));
        });
    }
    static createAnswerAK03(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id),
            });
            if (!result)
                throw new error_1.NotFoundError("Result");
            let header = yield drizzle_1.db.query.resultAk03Header.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, data.result_id),
            });
            if (!header) {
                const [created] = yield drizzle_1.db.insert(schema_1.resultAk03Header).values({
                    result_id: data.result_id,
                    comment: data.comment,
                });
                header = yield drizzle_1.db.query.resultAk03Header.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, data.result_id),
                });
                if (!header)
                    throw new error_1.NotFoundError("AK03 Header");
            }
            else {
                yield drizzle_1.db
                    .update(schema_1.resultAk03Header)
                    .set({ comment: data.comment })
                    .where((0, drizzle_orm_1.eq)(schema_1.resultAk03Header.id, header.id));
                yield drizzle_1.db.delete(schema_1.resultAk03).where((0, drizzle_orm_1.eq)(schema_1.resultAk03.header_id, header.id));
            }
            for (const item of data.items) {
                yield drizzle_1.db.insert(schema_1.resultAk03).values({
                    header_id: header.id,
                    question: item.question,
                    answer: item.answer,
                    comment: item.comment,
                });
            }
            const answers = yield drizzle_1.db.query.resultAk03.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk03.header_id, header.id),
            });
            return formatAK03Response(Object.assign(Object.assign({}, header), { answers }));
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, result.schedule_id) });
            if (!schedule) {
                throw new error_1.NotFoundError('Schedule');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, result.id) });
            if (!header)
                throw new error_1.NotFoundError('Result header');
            const answers = yield drizzle_1.db.query.resultAk03.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03.header_id, header.id) });
            return {
                id: result.id,
                schedule: schedule,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                result_ak03: Object.assign(Object.assign({}, header), { answers }),
            };
        });
    }
}
exports.AK03Service = AK03Service;
function formatAK03Response(header) {
    return {
        id: header.id,
        result_id: header.result_id,
        comment: header.comment,
        rows: header.answers.map((row) => ({
            id: row.id,
            header_id: row.header_id,
            question: row.question,
            answer: row.answer,
            comment: row.comment,
        })),
    };
}
