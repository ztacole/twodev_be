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
            yield drizzle_1.db.insert(schema_1.user).values({
                fullName: data.full_name,
                email: data.email,
                password: hashedPassword,
                roleId: data.role_id,
            });
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email) });
            if (!user)
                throw new error_1.NotFoundError('User');
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) });
            return formatUserResponse(Object.assign(Object.assign({}, user), { role }));
        });
    }
    static getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield drizzle_1.db.select().from(schema_1.user);
            const roles = yield drizzle_1.db.select().from(schema_1.role);
            const roleById = new Map(roles.map(r => [r.id, r]));
            return users.map(u => formatUserResponse(Object.assign(Object.assign({}, u), { role: roleById.get(u.roleId) })));
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, id) });
            if (!user)
                throw new error_1.NotFoundError('User');
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) });
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
                fullName: (_a = data.full_name) !== null && _a !== void 0 ? _a : existing.fullName,
                email: (_b = data.email) !== null && _b !== void 0 ? _b : existing.email,
                password: hashedPassword !== null && hashedPassword !== void 0 ? hashedPassword : existing.password,
                roleId: (_c = data.role_id) !== null && _c !== void 0 ? _c : existing.roleId,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.user.id, id));
            const updated = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, id) });
            if (!updated)
                throw new error_1.NotFoundError('User');
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, updated.roleId) });
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
        full_name: user.fullName,
        email: user.email,
        role: {
            id: user.role.id,
            name: user.role.name,
        },
        created_at: user.createdAt,
        updated_at: user.updatedAt,
    };
}
