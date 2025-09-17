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
    static getByAssessorId(assessor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessor_id) });
            return detail;
        });
    }
    static upsertByAssessorId(assessor_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const existing = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessor_id) });
            if (existing) {
                yield drizzle_1.db.update(schema_1.assessorDetail)
                    .set({
                    tax_id_number: (_a = data.tax_id_number) !== null && _a !== void 0 ? _a : existing.tax_id_number,
                    bank_book_cover: (_b = data.bank_book_cover) !== null && _b !== void 0 ? _b : existing.bank_book_cover,
                    certificate: (_c = data.certificate) !== null && _c !== void 0 ? _c : existing.certificate,
                    national_id: (_d = data.national_id) !== null && _d !== void 0 ? _d : existing.national_id,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessor_id));
                const updated = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessor_id) });
                return updated;
            }
            yield drizzle_1.db.insert(schema_1.assessorDetail).values({
                assessor_id,
                tax_id_number: (_e = data.tax_id_number) !== null && _e !== void 0 ? _e : '',
                bank_book_cover: (_f = data.bank_book_cover) !== null && _f !== void 0 ? _f : '',
                certificate: (_g = data.certificate) !== null && _g !== void 0 ? _g : '',
                national_id: (_h = data.national_id) !== null && _h !== void 0 ? _h : '',
                id_card: (_j = data.id_card) !== null && _j !== void 0 ? _j : ''
            });
            const created = yield drizzle_1.db.query.assessorDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessor_id) });
            return created;
        });
    }
}
exports.AssessorDetailService = AssessorDetailService;
