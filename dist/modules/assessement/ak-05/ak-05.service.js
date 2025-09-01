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
const db_1 = require("../../../config/db");
const error_1 = require("../../../common/error");
class AK05Service {
    static createAK05(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            const result = yield db_1.prisma.result.findUnique({ where: { id: data.result_id } });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const upserted = yield db_1.prisma.result_ak05.upsert({
                where: { result_id: data.result_id },
                update: {
                    is_competent: (_b = (_a = data.items[0]) === null || _a === void 0 ? void 0 : _a.is_competent) !== null && _b !== void 0 ? _b : false,
                    description: (_c = data.items[0]) === null || _c === void 0 ? void 0 : _c.description,
                    negative_positive_aspects: (_d = data.items[0]) === null || _d === void 0 ? void 0 : _d.negative_positive_aspects,
                    rejection_notes: (_e = data.items[0]) === null || _e === void 0 ? void 0 : _e.rejection_notes,
                    improvement_suggestions: (_f = data.items[0]) === null || _f === void 0 ? void 0 : _f.improvement_suggestions,
                    approved_assessor: (_h = (_g = data.items[0]) === null || _g === void 0 ? void 0 : _g.approved_assessor) !== null && _h !== void 0 ? _h : false,
                },
                create: {
                    result_id: data.result_id,
                    is_competent: (_k = (_j = data.items[0]) === null || _j === void 0 ? void 0 : _j.is_competent) !== null && _k !== void 0 ? _k : false,
                    description: (_m = (_l = data.items[0]) === null || _l === void 0 ? void 0 : _l.description) !== null && _m !== void 0 ? _m : null,
                    negative_positive_aspects: (_p = (_o = data.items[0]) === null || _o === void 0 ? void 0 : _o.negative_positive_aspects) !== null && _p !== void 0 ? _p : null,
                    rejection_notes: (_r = (_q = data.items[0]) === null || _q === void 0 ? void 0 : _q.rejection_notes) !== null && _r !== void 0 ? _r : null,
                    improvement_suggestions: (_t = (_s = data.items[0]) === null || _s === void 0 ? void 0 : _s.improvement_suggestions) !== null && _t !== void 0 ? _t : null,
                    approved_assessor: (_v = (_u = data.items[0]) === null || _u === void 0 ? void 0 : _u.approved_assessor) !== null && _v !== void 0 ? _v : false,
                },
            });
            if (upserted.is_competent) {
                yield db_1.prisma.result.update({
                    where: { id: data.result_id },
                    data: { is_competent: true },
                });
            }
            return [formatAK05Response(upserted)];
        });
    }
    static getAK05ByResultId(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ak05 = yield db_1.prisma.result_ak05.findUnique({
                where: { result_id },
            });
            return ak05 ? formatAK05Response(ak05) : null;
        });
    }
    // AK-05 Approval
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield db_1.prisma.result_ak05.update({
                where: { result_id: resultId },
                data: { approved_assessor: true, updated_at: new Date() },
            });
            if (!record)
                throw new error_1.NotFoundError('AK05');
            return record;
        });
    }
}
exports.AK05Service = AK05Service;
function formatAK05Response(ak05) {
    return {
        id: ak05.id,
        result_id: ak05.result_id,
        is_competent: ak05.is_competent,
        description: ak05.description,
        negative_positive_aspects: ak05.negative_positive_aspects,
        rejection_notes: ak05.rejection_notes,
        improvement_suggestions: ak05.improvement_suggestions,
        approved_assessor: ak05.approved_assessor,
    };
}
