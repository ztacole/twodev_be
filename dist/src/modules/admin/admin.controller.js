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
exports.AdminController = void 0;
const async_handler_1 = require("../../common/async.handler");
const admin_service_1 = require("./admin.service");
exports.AdminController = {
    getAdmins: (0, async_handler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield admin_service_1.AdminService.getAdmins();
        res.json({ success: true, message: 'Daftar admin', data });
    })),
    getAdminById: (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield admin_service_1.AdminService.getAdminById(Number(req.params.id));
        if (!data)
            return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
        res.json({ success: true, message: 'Detail admin', data });
    })),
};
