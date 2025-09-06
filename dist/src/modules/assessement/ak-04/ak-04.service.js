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
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.resultId, data.result_id)
            });
            if (existing) {
                yield drizzle_1.db
                    .update(schema_1.resultAk04)
                    .set({
                    approvedAssessee: (_a = data.approved_assessee) !== null && _a !== void 0 ? _a : false,
                    q1Yes: data.q1_yes,
                    q2Yes: data.q2_yes,
                    q3Yes: data.q3_yes,
                    reason: (_b = data.reason) !== null && _b !== void 0 ? _b : ''
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id));
                const updated = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id) });
                return updated;
            }
            yield drizzle_1.db
                .insert(schema_1.resultAk04)
                .values({
                resultId: data.result_id,
                approvedAssessee: (_c = data.approved_assessee) !== null && _c !== void 0 ? _c : false,
                q1Yes: data.q1_yes,
                q2Yes: data.q2_yes,
                q3Yes: data.q3_yes,
                reason: (_d = data.reason) !== null && _d !== void 0 ? _d : ''
            });
            const created = yield drizzle_1.db.query.resultAk04.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.resultId, data.result_id)
            });
            return created;
        });
    }
    static getAK04ByResultId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield drizzle_1.db.query.resultAk04.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.resultId, resultId)
            });
            if (!record)
                throw new error_1.NotFoundError('AK04');
            return record;
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield drizzle_1.db.query.resultAk04.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.resultId, resultId)
            });
            if (!record)
                throw new error_1.NotFoundError('AK04');
            return record;
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.resultId, resultId) });
            if (!existing)
                throw new error_1.NotFoundError('AK04');
            yield drizzle_1.db.update(schema_1.resultAk04).set({ approvedAssessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id));
            const updated = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, existing.id) });
            return updated;
        });
    }
}
exports.AK04Service = AK04Service;
