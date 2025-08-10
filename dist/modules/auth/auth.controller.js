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
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const db_1 = require("../../config/db");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, confirm_password, role_id } = req.body;
                if (!email || !password || !confirm_password || !role_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email, password, confirm_password, dan role_id wajib diisi'
                    });
                }
                if (password.length < 6) {
                    return res.status(400).json({
                        success: false,
                        message: 'Password minimal 6 karakter'
                    });
                }
                if (password !== confirm_password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Password dan confirm password tidak sama'
                    });
                }
                const result = yield this.authService.register({ email, password, confirm_password, role_id });
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email and password are required'
                    });
                }
                const result = yield this.authService.login({ email, password });
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: result
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
        });
    }
    me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                if (!token) {
                    return res.status(401).json({
                        success: false,
                        message: 'Token is required'
                    });
                }
                const decoded = yield this.authService.verifyToken(token);
                const user = yield db_1.prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        role_id: true,
                    }
                });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                res.status(200).json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
        });
    }
}
exports.AuthController = AuthController;
