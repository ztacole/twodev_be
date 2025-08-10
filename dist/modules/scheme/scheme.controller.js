"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.exportSchemesToExcel = exports.deleteScheme = exports.updateScheme = exports.getSchemeById = exports.getSchemes = exports.createScheme = void 0;
const schemeService = __importStar(require("./scheme.service"));
const createScheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scheme = yield schemeService.createScheme(req.body);
        res.status(201).json({
            success: true,
            message: 'Skema berhasil dibuat',
            data: scheme,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
        });
    }
});
exports.createScheme = createScheme;
const getSchemes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schemes = yield schemeService.getSchemes();
        res.json({
            success: true,
            message: 'Skema berhasil diambil',
            data: schemes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
        });
    }
});
exports.getSchemes = getSchemes;
const getSchemeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scheme = yield schemeService.getSchemeById(Number(req.params.id));
        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Skema tidak ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Skema berhasil diambil',
            data: scheme,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
        });
    }
});
exports.getSchemeById = getSchemeById;
const updateScheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scheme = yield schemeService.updateScheme(Number(req.params.id), req.body);
        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Skema tidak ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Skema berhasil diperbarui',
            data: scheme,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
        });
    }
});
exports.updateScheme = updateScheme;
const deleteScheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scheme = yield schemeService.deleteScheme(Number(req.params.id));
        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Skema tidak ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Skema berhasil dihapus',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
        });
    }
});
exports.deleteScheme = deleteScheme;
const exportSchemesToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Import the export function from service
        const { exportSchemesToExcel } = yield Promise.resolve().then(() => __importStar(require('./scheme.service')));
        // Generate Excel buffer
        const buffer = yield exportSchemesToExcel();
        // Set headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=schemes.xlsx');
        // Send the Excel file
        res.send(buffer);
    }
    catch (error) {
        console.error('Error exporting schemes to Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengekspor data ke Excel',
        });
    }
});
exports.exportSchemesToExcel = exportSchemesToExcel;
