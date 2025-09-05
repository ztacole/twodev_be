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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../../common/error");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    static register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield drizzle_1.db.query.user.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email)
            });
            if (existingUser) {
                throw new error_1.DuplicateEntryError('Pengguna', data.email);
            }
            const existingRole = yield drizzle_1.db.query.role.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.role.id, data.role_id)
            });
            if (!existingRole) {
                throw new error_1.ValidationError(`Role dengan ID ${data.role_id} tidak ditemukan. Pastikan role_id yang digunakan valid.`);
            }
            const saltRounds = 10;
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, saltRounds);
            yield drizzle_1.db.insert(schema_1.user).values({
                fullName: data.full_name,
                email: data.email,
                password: hashedPassword,
                roleId: data.role_id
            });
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email) });
            if (!user)
                throw new error_1.NotFoundError('Pengguna');
            const token = this.generateToken(user.id, user.email, user.roleId);
            return {
                user: {
                    id: user.id,
                    full_name: user.fullName,
                    email: user.email,
                    role_id: user.roleId
                },
                token
            };
        });
    }
    static login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield drizzle_1.db.query.user.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email),
            });
            if (!user) {
                throw new error_1.ValidationError('Email atau password tidak valid');
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new error_1.ValidationError('Email atau password tidak valid');
            }
            const token = this.generateToken(user.id, user.email, user.roleId);
            return {
                user: {
                    id: user.id,
                    full_name: user.fullName,
                    email: user.email,
                    role_id: user.roleId
                },
                token
            };
        });
    }
    static getMe(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield drizzle_1.db.query.user.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.user.id, userId),
            });
            if (!user) {
                throw new error_1.NotFoundError('Pengguna');
            }
            const role = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.roleId) });
            // assessor / assessee / admin relations can be fetched where needed in their modules
            return Object.assign(Object.assign({}, user), { role });
        });
    }
    static verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                return decoded;
            }
            catch (error) {
                throw new Error('Token tidak valid');
            }
        });
    }
    static generateToken(userId, email, role_id) {
        const payload = {
            userId,
            email,
            role_id
        };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
}
exports.AuthService = AuthService;
