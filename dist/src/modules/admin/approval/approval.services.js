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
exports.ApprovalService = void 0;
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.ApprovalService = {
    approveApl01Document(docId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user.id),
            });
            if (!admin) {
                throw new Error("Hanya admin yang dapat melakukan approval dokumen APL-01");
            }
            yield drizzle_1.db.update(schema_1.resultDoc).set({ approved: true }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, docId));
            const resultDoc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, docId) });
            return resultDoc;
        });
    },
    approveCompetency(resultId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role_id !== 1) {
                throw new Error("Hanya admin yang dapat melakukan approval kompetensi");
            }
            yield drizzle_1.db.update(schema_1.result).set({ is_competent: true }).where((0, drizzle_orm_1.eq)(schema_1.result.id, resultId));
        });
    },
};
