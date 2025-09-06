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
exports.AssessorDetailService = void 0;
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AssessorDetailService {
    static getByAssessorId(assessorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessorId, assessorId) });
            return detail;
        });
    }
    static upsertByAssessorId(assessorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const existing = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessorId, assessorId) });
            if (existing) {
                yield drizzle_1.db.update(schema_1.assessorDetail)
                    .set({
                    taxIdNumber: (_a = data.tax_id_number) !== null && _a !== void 0 ? _a : existing.taxIdNumber,
                    bankBookCover: (_b = data.bank_book_cover) !== null && _b !== void 0 ? _b : existing.bankBookCover,
                    certificate: (_c = data.certificate) !== null && _c !== void 0 ? _c : existing.certificate,
                    nationalId: (_d = data.national_id) !== null && _d !== void 0 ? _d : existing.nationalId,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessorId, assessorId));
                const updated = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessorId, assessorId) });
                return updated;
            }
            yield drizzle_1.db.insert(schema_1.assessorDetail).values({
                assessorId,
                taxIdNumber: (_e = data.tax_id_number) !== null && _e !== void 0 ? _e : '',
                bankBookCover: (_f = data.bank_book_cover) !== null && _f !== void 0 ? _f : '',
                certificate: (_g = data.certificate) !== null && _g !== void 0 ? _g : '',
                nationalId: (_h = data.national_id) !== null && _h !== void 0 ? _h : '',
            });
            const created = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessorId, assessorId) });
            return created;
        });
    }
}
exports.AssessorDetailService = AssessorDetailService;
