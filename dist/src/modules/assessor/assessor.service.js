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
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AssessorService {
    static getAssessors() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessors = yield drizzle_1.db.select().from(schema_1.assessor);
            const userIds = assessors.map(a => a.userId);
            const schemeIds = assessors.map(a => a.schemeId);
            const users = userIds.length ? yield drizzle_1.db.select().from(schema_1.user) : [];
            const roles = yield drizzle_1.db.select().from(schema_1.role);
            const schemes = schemeIds.length ? yield drizzle_1.db.select().from(schema_1.scheme) : [];
            const roleById = new Map(roles.map(r => [r.id, r]));
            const userById = new Map(users.map(u => [u.id, u]));
            const schemeById = new Map(schemes.map(s => [s.id, s]));
            return assessors.map(a => {
                var _a;
                return this.formatAssessorResponse(Object.assign(Object.assign({}, a), { user: Object.assign(Object.assign({}, userById.get(a.userId)), { role: roleById.get((_a = userById.get(a.userId)) === null || _a === void 0 ? void 0 : _a.roleId) }), scheme: schemeById.get(a.schemeId) }));
            });
        });
    }
    static getAssessorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const a = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!a)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, a.userId) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, a.schemeId) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, a), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static getAssessorByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const a = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.userId, userId) });
            if (!a)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, a.userId) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, a.schemeId) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, a), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static createAssessor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.userId, data.user_id) });
            if (existing) {
                throw new error_1.DuplicateEntryError('Assessor untuk user_id', data.user_id.toString());
            }
            yield drizzle_1.db.insert(schema_1.assessor).values({
                userId: data.user_id,
                schemeId: data.scheme_id,
                noRegMet: data.no_reg_met,
                address: data.address,
                phoneNo: data.phone_no,
                birthDate: new Date(data.birth_date),
            });
            const created = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.assessor.userId, data.user_id), (0, drizzle_orm_1.eq)(schema_1.assessor.schemeId, data.scheme_id)) });
            if (!created)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, created.userId) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, created.schemeId) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, created), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static updateAssessor(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Assessor');
            }
            yield drizzle_1.db.update(schema_1.assessor)
                .set({
                userId: data.user_id,
                schemeId: data.scheme_id,
                noRegMet: data.no_reg_met,
                address: data.address,
                phoneNo: data.phone_no,
                birthDate: new Date(data.birth_date),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.assessor.id, id));
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!assessor)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.userId) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, assessor.schemeId) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, assessor), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static deleteAssessor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Assessor');
            }
            yield drizzle_1.db.delete(schema_1.assessor).where((0, drizzle_orm_1.eq)(schema_1.assessor.id, id));
        });
    }
    static formatAssessorResponse(assessor) {
        return {
            id: assessor.id,
            user_id: assessor.userId,
            scheme_id: assessor.schemeId,
            name: assessor.user.fullName,
            address: assessor.address,
            phone_no: assessor.phoneNo,
            birth_date: assessor.birthDate,
            no_reg_met: assessor.noRegMet
        };
    }
}
exports.AssessorService = AssessorService;
