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
exports.deleteAssessor = exports.updateAssessor = exports.getAssessorById = exports.getAssessors = exports.createAssessor = void 0;
const assessorService = __importStar(require("./assessor.service"));
const createAssessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessor = yield assessorService.createAssessor(req.body);
        res.status(201).json({
            success: true,
            message: 'Data Assessor Berhasil Ditambahkan',
            data: assessor,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.createAssessor = createAssessor;
const getAssessors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessors = yield assessorService.getAssessors();
        res.json({
            success: true,
            message: 'Data Assessor Berhasil Diambil',
            data: assessors,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getAssessors = getAssessors;
const getAssessorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessor = yield assessorService.getAssessorById(Number(req.params.id));
        if (!assessor) {
            return res.status(404).json({
                success: false,
                message: 'Data Assessor Tidak Ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Data Assessor Berhasil Diambil',
            data: assessor,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getAssessorById = getAssessorById;
const updateAssessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessor = yield assessorService.updateAssessor(Number(req.params.id), req.body);
        if (!assessor) {
            return res.status(404).json({
                success: false,
                message: 'Data Assessor Tidak Ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Data Assessor Berhasil Diubah',
            data: assessor,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.updateAssessor = updateAssessor;
const deleteAssessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessor = yield assessorService.deleteAssessor(Number(req.params.id));
        if (!assessor) {
            return res.status(404).json({
                success: false,
                message: 'Data Assessor Tidak Ditemukan',
            });
        }
        res.json({
            success: true,
            message: 'Data Assessor Berhasil Dihapus',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.deleteAssessor = deleteAssessor;
