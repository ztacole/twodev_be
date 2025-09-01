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
exports.AssessorService = void 0;
const db_1 = require("../../config/db");
const error_1 = require("../../common/error");
class AssessorService {
    static getAssessors() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessors = yield db_1.prisma.assessor.findMany({
                include: {
                    user: { include: { role: true } },
                    scheme: true,
                },
            });
            return assessors.map(this.formatAssessorResponse);
        });
    }
    static getAssessorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessor = yield db_1.prisma.assessor.findUnique({
                where: { id },
                include: {
                    user: { include: { role: true } },
                    scheme: true,
                },
            });
            if (!assessor) {
                throw new error_1.NotFoundError('Assessor');
            }
            return this.formatAssessorResponse(assessor);
        });
    }
    static getAssessorByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessor = yield db_1.prisma.assessor.findUnique({
                where: { user_id: userId },
                include: {
                    user: { include: { role: true } },
                    scheme: true,
                },
            });
            if (!assessor) {
                throw new error_1.NotFoundError('Assessor');
            }
            return this.formatAssessorResponse(assessor);
        });
    }
    static createAssessor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield db_1.prisma.assessor.findFirst({
                where: { user_id: data.user_id }
            });
            if (existing) {
                throw new error_1.DuplicateEntryError('Assessor untuk user_id', data.user_id.toString());
            }
            const assessor = yield db_1.prisma.assessor.create({
                data: Object.assign(Object.assign({}, data), { birth_date: new Date(data.birth_date), no_reg_met: data.no_reg_met }),
                include: {
                    user: { include: { role: true } },
                    scheme: true,
                },
            });
            return this.formatAssessorResponse(assessor);
        });
    }
    static updateAssessor(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield db_1.prisma.assessor.findUnique({ where: { id } });
            if (!existing) {
                throw new error_1.NotFoundError('Assessor');
            }
            const assessor = yield db_1.prisma.assessor.update({
                where: { id },
                data: Object.assign(Object.assign({}, data), { birth_date: new Date(data.birth_date), no_reg_met: data.no_reg_met }),
                include: {
                    user: { include: { role: true } },
                    scheme: true,
                },
            });
            return this.formatAssessorResponse(assessor);
        });
    }
    static deleteAssessor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield db_1.prisma.assessor.findUnique({ where: { id } });
            if (!existing) {
                throw new error_1.NotFoundError('Assessor');
            }
            yield db_1.prisma.assessor.delete({ where: { id } });
        });
    }
    static formatAssessorResponse(assessor) {
        return {
            id: assessor.id,
            user_id: assessor.user_id,
            scheme_id: assessor.scheme_id,
            address: assessor.address,
            phone_no: assessor.phone_no,
            birth_date: assessor.birth_date,
            no_reg_met: assessor.no_reg_met
        };
    }
}
exports.AssessorService = AssessorService;
