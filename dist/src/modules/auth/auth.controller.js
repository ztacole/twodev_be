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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const async_handler_1 = require("../../common/async.handler");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, email, password, confirm_password, role_id } = req.body;
    if (!full_name || !email || !password || !confirm_password || !role_id) {
        return res.status(400).json({
            success: false,
            message: 'Full name, email, password, confirm_password, dan role_id wajib diisi'
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
    const result = yield auth_service_1.AuthService.register({ full_name, email, password, confirm_password, role_id });
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
    });
}));
AuthController.login = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    const result = yield auth_service_1.AuthService.login({ email, password });
    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
    });
}));
AuthController.me = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token is required'
        });
    }
    const decoded = yield auth_service_1.AuthService.verifyToken(token);
    const user = yield auth_service_1.AuthService.getMe(decoded.userId);
    res.status(200).json({
        success: true,
        data: user
    });
}));
