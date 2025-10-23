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
exports.AK05Service = void 0;
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../../../common/error");
class AK05Service {
    static createAK05(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const existing = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, data.result_id) });
            if (existing) {
                yield drizzle_1.db
                    .update(schema_1.resultAk05)
                    .set({
                    is_competent: (_b = (_a = data.items[0]) === null || _a === void 0 ? void 0 : _a.is_competent) !== null && _b !== void 0 ? _b : false,
                    description: (_d = (_c = data.items[0]) === null || _c === void 0 ? void 0 : _c.description) !== null && _d !== void 0 ? _d : null,
                    negative_positive_aspects: (_f = (_e = data.items[0]) === null || _e === void 0 ? void 0 : _e.negative_positive_aspects) !== null && _f !== void 0 ? _f : null,
                    rejection_notes: (_h = (_g = data.items[0]) === null || _g === void 0 ? void 0 : _g.rejection_notes) !== null && _h !== void 0 ? _h : null,
                    improvement_suggestions: (_k = (_j = data.items[0]) === null || _j === void 0 ? void 0 : _j.improvement_suggestions) !== null && _k !== void 0 ? _k : null,
                    notes: (_m = (_l = data.items[0]) === null || _l === void 0 ? void 0 : _l.notes) !== null && _m !== void 0 ? _m : null,
                    approved_assessor: (_p = (_o = data.items[0]) === null || _o === void 0 ? void 0 : _o.approved_assessor) !== null && _p !== void 0 ? _p : false,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, data.result_id));
            }
            else {
                yield drizzle_1.db.insert(schema_1.resultAk05).values({
                    result_id: data.result_id,
                    is_competent: (_r = (_q = data.items[0]) === null || _q === void 0 ? void 0 : _q.is_competent) !== null && _r !== void 0 ? _r : false,
                    description: (_t = (_s = data.items[0]) === null || _s === void 0 ? void 0 : _s.description) !== null && _t !== void 0 ? _t : null,
                    negative_positive_aspects: (_v = (_u = data.items[0]) === null || _u === void 0 ? void 0 : _u.negative_positive_aspects) !== null && _v !== void 0 ? _v : null,
                    rejection_notes: (_x = (_w = data.items[0]) === null || _w === void 0 ? void 0 : _w.rejection_notes) !== null && _x !== void 0 ? _x : null,
                    improvement_suggestions: (_z = (_y = data.items[0]) === null || _y === void 0 ? void 0 : _y.improvement_suggestions) !== null && _z !== void 0 ? _z : null,
                    notes: (_1 = (_0 = data.items[0]) === null || _0 === void 0 ? void 0 : _0.notes) !== null && _1 !== void 0 ? _1 : null,
                    approved_assessor: (_3 = (_2 = data.items[0]) === null || _2 === void 0 ? void 0 : _2.approved_assessor) !== null && _3 !== void 0 ? _3 : false,
                });
            }
            const ak05 = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, data.result_id) });
            if (!ak05)
                throw new error_1.NotFoundError('AK05');
            const enriched = yield buildAK05Response(ak05);
            return [enriched];
        });
    }
    static getAK05ByResultId(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ak05 = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, result_id) });
            if (!ak05)
                return null;
            return yield buildAK05Response(ak05);
        });
    }
    // AK-05 Approval
    static approvedByAssessor(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield drizzle_1.db.update(schema_1.resultAk05).set({ approved_assessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, result_id));
            const updated = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, result_id) });
            if (!updated)
                throw new error_1.NotFoundError('AK05');
            return yield buildAK05Response(updated);
        });
    }
}
exports.AK05Service = AK05Service;
function buildAK05Response(ak05) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, ak05.result_id) });
        if (!result)
            throw new error_1.NotFoundError('Result');
        const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, result.schedule_id) });
        if (!schedule)
            throw new error_1.NotFoundError('Schedule');
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
        let occupation = null;
        let scheme = null;
        if (assessment) {
            occupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) });
            if (occupation) {
                scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) });
            }
        }
        const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
        const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
        const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
        const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
        const ia01Header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result.id) });
        if (!ia01Header)
            throw new error_1.NotFoundError('Result header');
        return {
            id: ak05.id,
            result: {
                id: result.id,
                schedule: schedule,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
                tuk: result.tuk,
                created_at: result.created_at,
                result_ak05: {
                    id: ak05.id,
                    is_competent: ia01Header.is_competent,
                    description: ak05.description,
                    negative_positive_aspects: ak05.negative_positive_aspects,
                    rejection_notes: ak05.rejection_notes,
                    improvement_suggestions: ak05.improvement_suggestions,
                    notes: ak05.notes,
                    approved_assessor: ak05.approved_assessor,
                },
            },
            is_competent: ia01Header.is_competent,
        };
    });
}
