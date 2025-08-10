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
exports.exportOccupationsToExcel = exports.deleteOccupation = exports.updateOccupation = exports.getOccupationById = exports.getOccupations = exports.createOccupation = void 0;
const occupationService = __importStar(require("./occupation.service"));
const createOccupation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const occupationData = req.body;
        const occupation = yield occupationService.createOccupation(occupationData);
        res.status(201).json({
            success: true,
            message: 'Occupation berhasil dibuat',
            data: occupation,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
});
exports.createOccupation = createOccupation;
const getOccupations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const occupations = yield occupationService.getOccupations();
        res.json({
            success: true,
            message: 'Data occupation berhasil diambil',
            data: occupations,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
});
exports.getOccupations = getOccupations;
const getOccupationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const occupation = yield occupationService.getOccupationById(Number(req.params.id));
        if (!occupation) {
            return res.status(404).json({
                success: false,
                message: 'Occupation tidak ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Data occupation berhasil diambil',
            data: occupation,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
});
exports.getOccupationById = getOccupationById;
const updateOccupation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const occupation = yield occupationService.updateOccupation(Number(req.params.id), req.body);
        if (!occupation) {
            return res.status(404).json({
                success: false,
                message: 'Occupation tidak ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Occupation berhasil diperbarui',
            data: occupation,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
});
exports.updateOccupation = updateOccupation;
const deleteOccupation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const occupation = yield occupationService.deleteOccupation(Number(req.params.id));
        if (!occupation) {
            return res.status(404).json({
                success: false,
                message: 'Occupation tidak ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Occupation berhasil dihapus',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
});
exports.deleteOccupation = deleteOccupation;
const exportOccupationsToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exportOccupationsToExcel } = require('./occupation.service');
        // Generate Excel buffer
        const buffer = yield exportOccupationsToExcel();
        // Set headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=occupations.xlsx');
        // Send the Excel file
        res.send(buffer);
    }
    catch (error) {
        console.error('Error exporting occupations to Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengekspor data ke Excel',
        });
    }
});
exports.exportOccupationsToExcel = exportOccupationsToExcel;
