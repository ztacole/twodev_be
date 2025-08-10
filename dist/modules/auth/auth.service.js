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
const db_1 = require("../../config/db");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield db_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                throw new Error('User already exists with this email');
            }
            const saltRounds = 10;
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, saltRounds);
            const user = yield db_1.prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    role_id: data.role_id
                }
            });
            const token = this.generateToken(user.id, user.email);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role_id: user.role_id
                },
                token
            };
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
                throw new Error('Invalid email or password');
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            const token = this.generateToken(user.id, user.email);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role_id: user.role_id
                },
                token
            };
        });
    }
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                return decoded;
            }
            catch (error) {
                throw new Error('Invalid token');
            }
        });
    }
    generateToken(userId, email) {
        const payload = {
            userId,
            email
        };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
}
exports.AuthService = AuthService;
