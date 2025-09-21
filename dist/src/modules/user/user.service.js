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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class UserService {
    static createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            const existing = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email) });
            if (existing) {
                throw new error_1.DuplicateEntryError('Email', data.email);
            }
            yield drizzle_1.db.insert(schema_1.user).values({
                full_name: data.full_name,
                email: data.email,
                password: hashedPassword,
                role_id: data.role_id,
            });
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email) });
            if (!user)
                throw new error_1.NotFoundError('User');
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.role_id) });
            return formatUserResponse(Object.assign(Object.assign({}, user), { role }));
        });
    }
    static getUsers() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, keyword, role_name) {
            var _a, _b;
            const offset = (page - 1) * limit;
            const users = yield drizzle_1.db.select({
                id: schema_1.user.id,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role_id: schema_1.user.role_id,
                created_at: schema_1.user.created_at,
                updated_at: schema_1.user.updated_at,
                role: schema_1.role,
            })
                .from(schema_1.user)
                .leftJoin(schema_1.role, (0, drizzle_orm_1.eq)(schema_1.user.role_id, schema_1.role.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)(keyword ? (0, drizzle_orm_1.like)(schema_1.user.full_name, `%${keyword}%`) : undefined, keyword ? (0, drizzle_orm_1.like)(schema_1.user.email, `%${keyword}%`) : undefined), role_name ? (0, drizzle_orm_1.eq)(schema_1.role.name, role_name) : undefined))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.role.name), (0, drizzle_orm_1.asc)(schema_1.user.full_name), (0, drizzle_orm_1.asc)(schema_1.user.created_at))
                .limit(limit)
                .offset(offset);
            const countRows = yield drizzle_1.db.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` }).from(schema_1.user);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0);
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const [schemes, assessments, userAssessor, userAssessee] = yield Promise.all([
                drizzle_1.db.select().from(schema_1.scheme),
                drizzle_1.db.select().from(schema_1.assessment),
                drizzle_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.role_id, 2)),
                drizzle_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.role_id, 3)),
            ]);
            return {
                data: users.map((u) => formatUserResponse(u)),
                summary: {
                    totalSchemes: schemes.length,
                    totalAssessments: assessments.length,
                    totalAssessors: userAssessor.length,
                    totalAssessees: userAssessee.length,
                },
                meta: {
                    current_page: page,
                    limit,
                    total,
                    total_pages: totalPages,
                },
            };
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, id) });
            if (!user)
                throw new error_1.NotFoundError('User');
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.role_id) });
            return formatUserResponse(Object.assign(Object.assign({}, user), { role }));
        });
    }
    static updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const existing = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, id) });
            if (!existing)
                throw new error_1.NotFoundError('User');
            let hashedPassword;
            if (data.password) {
                hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            }
            yield drizzle_1.db.update(schema_1.user)
                .set({
                full_name: (_a = data.full_name) !== null && _a !== void 0 ? _a : existing.full_name,
                email: (_b = data.email) !== null && _b !== void 0 ? _b : existing.email,
                password: hashedPassword !== null && hashedPassword !== void 0 ? hashedPassword : existing.password,
                role_id: (_c = data.role_id) !== null && _c !== void 0 ? _c : existing.role_id,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.user.id, id));
            const updated = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, id) });
            if (!updated)
                throw new error_1.NotFoundError('User');
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, updated.role_id) });
            return formatUserResponse(Object.assign(Object.assign({}, updated), { role }));
        });
    }
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, id) });
            if (!existing)
                throw new error_1.NotFoundError('User');
            yield drizzle_1.db.delete(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.id, id));
        });
    }
}
exports.UserService = UserService;
function formatUserResponse(user) {
    return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: {
            id: user.role.id,
            name: user.role.name,
        },
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}
