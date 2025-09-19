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
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const async_handler_1 = require("../../common/async.handler");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.createUser = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserService.createUser(req.body);
    res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: user
    });
}));
UserController.getUsers = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const result = yield user_service_1.UserService.getUsers(page, limit);
    return res.status(200).json({
        success: true,
        message: 'Daftar user berhasil diambil',
        data: result.data,
        meta: result.meta
    });
}));
UserController.getUserById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserService.getUserById(Number(req.params.id));
    res.status(200).json({
        success: true,
        message: 'User berhasil diambil',
        data: user
    });
}));
UserController.updateUser = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserService.updateUser(Number(req.params.id), req.body);
    res.status(200).json({
        success: true,
        message: 'User berhasil diperbarui',
        data: user
    });
}));
UserController.deleteUser = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_service_1.UserService.deleteUser(Number(req.params.id));
    res.status(200).json({
        success: true,
        message: 'User berhasil dihapus',
    });
}));
