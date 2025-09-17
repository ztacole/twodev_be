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
exports.AK04Service = void 0;
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../../../common/error");
class AK04Service {
    static createAK04(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const existing = yield drizzle_1.db.query.resultAk04.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.result_id, data.result_id)
            });
            if (existing) {
                yield drizzle_1.db
                    .update(schema_1.resultAk04)
                    .set({
                    approved_assessee: (_a = data.approved_assessee) !== null && _a !== void 0 ? _a : false,
                    q1_yes: data.q1_yes,
                    q2_yes: data.q2_yes,
                    q3_yes: data.q3_yes,
                    reason: (_b = data.reason) !== null && _b !== void 0 ? _b : ''
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id));
                const updated = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id) });
                return updated;
            }
            yield drizzle_1.db
                .insert(schema_1.resultAk04)
                .values({
                result_id: data.result_id,
                approved_assessee: (_c = data.approved_assessee) !== null && _c !== void 0 ? _c : false,
                q1_yes: data.q1_yes,
                q2_yes: data.q2_yes,
                q3_yes: data.q3_yes,
                reason: (_d = data.reason) !== null && _d !== void 0 ? _d : ''
            });
            const created = yield drizzle_1.db.query.resultAk04.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.result_id, data.result_id)
            });
            return created;
        });
    }
    static getAK04ByResult_id(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const record = yield drizzle_1.db.query.resultAk04.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.result_id, result_id)
            });
            if (!record)
                throw new error_1.NotFoundError('AK04');
            return record;
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const header = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.result_id, result.id) });
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
                result_ak04: Object.assign({}, header),
            };
        });
    }
    static approvedByAssessee(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const existing = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.result_id, result_id) });
            if (!existing)
                throw new error_1.NotFoundError('AK04');
            yield drizzle_1.db.update(schema_1.resultAk04).set({ approved_assessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id));
            const updated = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id) });
            return updated;
        });
    }
}
exports.AK04Service = AK04Service;
