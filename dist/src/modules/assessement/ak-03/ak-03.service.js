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
            const existingHeader = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.resultId, data.result_id) });
            if (existingHeader) {
                throw new Error(`AK-03 with result_id ${data.result_id} already exists`);
            }
            const [created] = yield drizzle_1.db.insert(schema_1.resultAk03Header).values({
                resultId: data.result_id,
                comment: (_a = data.comment) !== null && _a !== void 0 ? _a : null,
            });
            const header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.resultId, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('AK03 Header');
            for (const item of data.items) {
                yield drizzle_1.db.insert(schema_1.resultAk03).values({
                    headerId: header.id,
                    question: item.question,
                    answer: item.answer,
                    comment: (_b = item.comment) !== null && _b !== void 0 ? _b : null,
                });
            }
            const answers = yield drizzle_1.db.query.resultAk03.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03.headerId, header.id) });
            return formatAK03Response(Object.assign(Object.assign({}, header), { answers }));
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessmentId) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessorId) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.userId) }) : null;
            const header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.resultId, result.id) });
            if (!header)
                throw new error_1.NotFoundError('Result header');
            const answers = yield drizzle_1.db.query.resultAk03.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03.headerId, header.id) });
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.fullName, email: assessorUser.email, no_reg_met: assessor.noRegMet } : null,
                tuk: result.tuk,
                is_competent: result.isCompetent,
                created_at: result.createdAt,
                result_ak03: Object.assign(Object.assign({}, header), { answers }),
            };
        });
    }
}
exports.AK03Service = AK03Service;
function formatAK03Response(header) {
    return {
        id: header.id,
        result_id: header.resultId,
        comment: header.comment,
        rows: header.answers.map((row) => ({
            id: row.id,
            header_id: row.headerId,
            question: row.question,
            answer: row.answer,
            comment: row.comment,
        })),
    };
}
