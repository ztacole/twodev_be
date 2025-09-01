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
const db_1 = require("../../config/db");
const error_1 = require("../../common/error");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    static createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            const user = yield db_1.prisma.user.create({
                data: {
                    full_name: data.full_name,
                    email: data.email,
                    password: hashedPassword,
                    role_id: data.role_id,
                },
                include: { role: true }
            });
            return formatUserResponse(user);
        });
    }
    static getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield db_1.prisma.user.findMany({
                include: { role: true }
            });
            return users.map(formatUserResponse);
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({
                where: { id },
                include: { role: true }
            });
            if (!user) {
                throw new error_1.NotFoundError('User');
            }
            return formatUserResponse(user);
        });
    }
    static updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const user = yield db_1.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new error_1.NotFoundError('User');
            }
            let hashedPassword;
            if (data.password) {
                hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            }
            const updatedUser = yield db_1.prisma.user.update({
                where: { id },
                data: {
                    full_name: (_a = data.full_name) !== null && _a !== void 0 ? _a : user.full_name,
                    email: (_b = data.email) !== null && _b !== void 0 ? _b : user.email,
                    password: hashedPassword !== null && hashedPassword !== void 0 ? hashedPassword : user.password,
                    role_id: (_c = data.role_id) !== null && _c !== void 0 ? _c : user.role_id,
                },
                include: { role: true }
            });
            return formatUserResponse(updatedUser);
        });
    }
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new error_1.NotFoundError('User');
            }
            yield db_1.prisma.user.delete({ where: { id } });
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
