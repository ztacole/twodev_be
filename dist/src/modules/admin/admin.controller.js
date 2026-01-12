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
exports.AdminController = void 0;
const async_handler_1 = require("../../common/async.handler");
const admin_service_1 = require("./admin.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
    createAdmin: (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { user_id, address, phone_no, birth_date, can_approve } = req.body;
        if (!user_id || !address || !phone_no || !birth_date) {
            return res.status(400).json({
                success: false,
                message: 'user_id, address, phone_no, dan birth_date wajib diisi'
            });
        }
        let signatureUrl = undefined;
        const files = req.files;
        if (files && files.signature && files.signature[0]) {
            signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
        }
        const data = yield admin_service_1.AdminService.createAdmin({
            user_id,
            address,
            phone_no,
            birth_date,
            can_approve: can_approve === undefined ? undefined : Boolean(Number(can_approve)),
            signature: signatureUrl
        });
        res.status(201).json({
            success: true,
            message: 'Admin berhasil dibuat',
            data
        });
    })),
    updateAdmin: (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = Number(req.params.id);
        const { full_name, email, address, phone_no, birth_date, can_approve } = req.body;
        if (!full_name && !email && !address && !phone_no && !birth_date && can_approve === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu field (full_name, email, address, phone_no, birth_date, atau can_approve) harus diisi'
            });
        }
        const data = yield admin_service_1.AdminService.updateAdmin(id, {
            full_name,
            email,
            address,
            phone_no,
            birth_date,
            can_approve: can_approve === undefined ? undefined : Boolean(Number(can_approve))
        });
        res.json({
            success: true,
            message: 'Admin berhasil diperbarui',
            data
        });
    })),
    deleteAdmin: (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = Number(req.params.id);
        const data = yield admin_service_1.AdminService.deleteAdmin(id);
        res.json({
            success: true,
            message: data.message,
            data: { id: data.id }
        });
    })),
    updateMyProfile: (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get user ID from token
        const { full_name, email, password, address, phone_no, birth_date, can_approve } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau user tidak ditemukan'
            });
        }
        if (!full_name && !email && !password && !address && !phone_no && !birth_date && can_approve === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Minimal satu field (full_name, email, password, address, phone_no, birth_date, atau can_approve) harus diisi'
            });
        }
        let signatureUrl = undefined;
        const files = req.files;
        const allAdmins = yield admin_service_1.AdminService.getAdmins();
        const existingAdmin = allAdmins.find((admin) => admin.user_id === userId);
        if (files && files.signature && files.signature[0]) {
            if (existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.signature) {
                try {
                    const oldFilePath = path_1.default.join(__dirname, '../../../public', existingAdmin.signature);
                    if (fs_1.default.existsSync(oldFilePath)) {
                        fs_1.default.unlinkSync(oldFilePath);
                    }
                }
                catch (error) {
                    // Ignore error if file doesn't exist
                }
            }
            signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
        }
        const data = yield admin_service_1.AdminService.updateAdminByUserId(userId, {
            full_name,
            email,
            password,
            address,
            phone_no,
            birth_date,
            can_approve: can_approve === undefined ? undefined : Boolean(Number(can_approve)),
            signature: signatureUrl
        });
        res.json({
            success: true,
            message: 'Profil admin berhasil diperbarui',
            data
        });
    }))
};
