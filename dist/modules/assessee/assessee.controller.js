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
exports.AssesseeController = void 0;
const assessee_service_1 = require("./assessee.service");
class AssesseeController {
    constructor() {
        this.assesseeService = new assessee_service_1.AssesseeService();
    }
    createAssesse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assesse = yield this.assesseeService.createAssesse(req.body);
                res.status(201).json({
                    success: true,
                    message: 'Data asesi berhasil dibuat',
                    data: assesse,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    getAssesses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assesses = yield this.assesseeService.getAssesses();
                res.json({
                    success: true,
                    message: 'Data asesi berhasil diambil',
                    data: assesses,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    getAssesseById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assesse = yield this.assesseeService.getAssesseById(Number(req.params.id));
                if (!assesse) {
                    return res.status(404).json({
                        success: false,
                        message: 'Data asesi tidak ditemukan',
                    });
                }
                res.json({
                    success: true,
                    message: 'Data asesi berhasil diambil',
                    data: assesse,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    updateAssesse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assesse = yield this.assesseeService.updateAssesse(Number(req.params.id), req.body);
                if (!assesse) {
                    return res.status(404).json({
                        success: false,
                        message: 'Data asesi tidak ditemukan',
                    });
                }
                res.json({
                    success: true,
                    message: 'Data asesi berhasil diubah',
                    data: assesse,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
    deleteAssesse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assesse = yield this.assesseeService.deleteAssesse(Number(req.params.id));
                if (!assesse) {
                    return res.status(404).json({
                        success: false,
                        message: 'Data asesi tidak ditemukan',
                    });
                }
                res.json({
                    success: true,
                    message: 'Data asesi berhasil dihapus',
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    ;
}
exports.AssesseeController = AssesseeController;
