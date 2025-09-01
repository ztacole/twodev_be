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
exports.AK02Controller = void 0;
const async_handler_1 = require("../../../common/async.handler");
const ak_02_service_1 = require("./ak-02.service");
class AK02Controller {
}
exports.AK02Controller = AK02Controller;
_a = AK02Controller;
AK02Controller.createAK02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Data diperlukan'
        });
    }
    try {
        const result = yield ak_02_service_1.AK02Service.createAK02(data);
        res.status(201).json({
            success: true,
            message: 'AK02 berhasil dibuat',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal membuat AK02',
            error: error.message
        });
    }
}));
AK02Controller.getAK02ById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID diperlukan'
        });
    }
    try {
        const result = yield ak_02_service_1.AK02Service.getAK02ById(id);
        res.status(200).json({
            success: true,
            message: 'AK02 berhasil diambil',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil AK02',
            error: error.message
        });
    }
}));
AK02Controller.getAK02ByResultId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
    }
    try {
        const result = yield ak_02_service_1.AK02Service.getAK02ByResultId(resultId);
        res.status(200).json({
            success: true,
            message: 'AK02 berhasil diambil',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil AK02',
            error: error.message
        });
    }
}));
AK02Controller.updateAK02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const data = req.body;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID diperlukan'
        });
    }
    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Data diperlukan'
        });
    }
    try {
        const result = yield ak_02_service_1.AK02Service.updateAK02(id, data);
        res.status(200).json({
            success: true,
            message: 'AK02 berhasil diperbarui',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui AK02',
            error: error.message
        });
    }
}));
AK02Controller.deleteAK02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID diperlukan'
        });
    }
    try {
        yield ak_02_service_1.AK02Service.deleteAK02(id);
        res.status(200).json({
            success: true,
            message: 'AK02 berhasil dihapus'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus AK02',
            error: error.message
        });
    }
}));
AK02Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
    }
    try {
        const result = yield ak_02_service_1.AK02Service.approvedByAssessor(resultId);
        res.status(200).json({
            success: true,
            message: 'AK02 berhasil disetujui',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menyetujui AK02',
            error: error.message,
        });
    }
}));
AK02Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
    }
    try {
        const result = yield ak_02_service_1.AK02Service.approvedByAssessee(resultId);
        res.status(200).json({
            success: true,
            message: 'AK02 berhasil disetujui',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menyetujui AK02',
            error: error.message,
        });
    }
}));
