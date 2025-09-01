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
const db_1 = require("../../../config/db");
const error_1 = require("../../../common/error");
class AK04Service {
    static createAK04(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const result = yield db_1.prisma.result.findUnique({ where: { id: data.result_id } });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const saved = yield db_1.prisma.result_ak04.upsert({
                where: { result_id: data.result_id },
                update: {
                    approved_assessee: (_a = data.approved_assessee) !== null && _a !== void 0 ? _a : false,
                    q1_yes: data.q1_yes,
                    q2_yes: data.q2_yes,
                    q3_yes: data.q3_yes,
                    reason: (_b = data.reason) !== null && _b !== void 0 ? _b : ''
                },
                create: {
                    result_id: data.result_id,
                    approved_assessee: (_c = data.approved_assessee) !== null && _c !== void 0 ? _c : false,
                    q1_yes: data.q1_yes,
                    q2_yes: data.q2_yes,
                    q3_yes: data.q3_yes,
                    reason: (_d = data.reason) !== null && _d !== void 0 ? _d : ''
                }
            });
            return saved;
        });
    }
    static getAK04ByResultId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield db_1.prisma.result_ak04.findFirst({ where: { result_id: resultId } });
            if (!record)
                throw new error_1.NotFoundError('AK04');
            return record;
        });
    }
    // AK-04 Approval
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield db_1.prisma.result_ak04.update({
                where: { result_id: resultId },
                data: { approved_assessee: true, updated_at: new Date() },
            });
            if (!record)
                throw new error_1.NotFoundError('AK04');
            return record;
        });
    }
}
exports.AK04Service = AK04Service;
