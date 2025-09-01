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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.ApprovalService = {
    approveApl01Document(docId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield prisma.admin.findUnique({
                where: { user_id: user.userId },
            });
            if (!admin) {
                throw new Error("Hanya admin yang dapat melakukan approval dokumen APL-01");
            }
            const resultDoc = yield prisma.result_doc.update({
                where: { id: docId },
                data: { approved: true },
            });
            return resultDoc;
        });
    },
    approveCompetency(resultId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role_id !== 1) {
                throw new Error("Hanya admin yang dapat melakukan approval kompetensi");
            }
            yield prisma.result.update({
                where: { id: resultId },
                data: { is_competent: true },
            });
        });
    },
};
