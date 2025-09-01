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
exports.approveVerification = exports.getVerificationDetail = exports.getApprovedVerifications = exports.getPendingVerifications = void 0;
const db_1 = require("../../config/db");
const error_1 = require("../../common/error");
const getPendingVerifications = () => __awaiter(void 0, void 0, void 0, function* () {
    const docs = yield db_1.prisma.result_doc.findMany({
        where: { approved: false },
        include: {
            result: {
                include: {
                    assessee: { include: { user: true } },
                    assessor: { include: { user: true } }
                }
            }
        },
        orderBy: { id: 'desc' }
    });
    return docs;
});
exports.getPendingVerifications = getPendingVerifications;
const getApprovedVerifications = () => __awaiter(void 0, void 0, void 0, function* () {
    const docs = yield db_1.prisma.result_doc.findMany({
        where: { approved: true },
        include: {
            result: {
                include: {
                    assessee: { include: { user: true } },
                    assessor: { include: { user: true } }
                }
            }
        },
        orderBy: { id: 'desc' }
    });
    return docs;
});
exports.getApprovedVerifications = getApprovedVerifications;
const getVerificationDetail = (resultId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.prisma.result.findUnique({
        where: { id: resultId },
        include: {
            assessee: { include: { user: true, jobs: true } },
            assessor: { include: { user: true } },
            docs: true
        }
    });
    if (!result)
        throw new error_1.NotFoundError('Result');
    return result;
});
exports.getVerificationDetail = getVerificationDetail;
const approveVerification = (resultId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield db_1.prisma.result.findUnique({ where: { id: resultId }, include: { docs: true } });
    if (!existing)
        throw new error_1.NotFoundError('Result');
    yield db_1.prisma.result.update({ where: { id: resultId }, data: { is_competent: true } });
    // mark related docs approved
    yield db_1.prisma.result_doc.updateMany({ where: { result_id: existing.id }, data: { approved: true } });
    return { success: true };
});
exports.approveVerification = approveVerification;
