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
exports.AK01Controller = void 0;
const async_handler_1 = require("../../../common/async.handler");
const ak_01_service_1 = require("./ak-01.service");
class AK01Controller {
}
exports.AK01Controller = AK01Controller;
_a = AK01Controller;
AK01Controller.createAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Data diperlukan'
        });
    }
    try {
        const result = yield ak_01_service_1.AK01Service.createAK01(data);
        res.status(201).json({
            success: true,
            message: 'AK01 berhasil dibuat',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal membuat AK01',
            error: error.message
        });
    }
}));
AK01Controller.getDataForAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
    }
    try {
        const result = yield ak_01_service_1.AK01Service.getDataForAK01(resultId);
        res.status(200).json({
            success: true,
            message: 'Data berhasil diambil',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data',
            error: error.message
        });
    }
}));
AK01Controller.getAK01ById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID diperlukan'
        });
    }
    try {
        const result = yield ak_01_service_1.AK01Service.getAK01ById(id);
        res.status(200).json({
            success: true,
            message: 'AK01 berhasil diambil',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil AK01',
            error: error.message
        });
    }
}));
AK01Controller.getAK01ByResultId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
    }
    try {
        const result = yield ak_01_service_1.AK01Service.getAK01ByResultId(resultId);
        res.status(200).json({
            success: true,
            message: 'AK01 berhasil diambil',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil AK01',
            error: error.message
        });
    }
}));
AK01Controller.updateAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield ak_01_service_1.AK01Service.updateAK01(id, data);
        res.status(200).json({
            success: true,
            message: 'AK01 berhasil diperbarui',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui AK01',
            error: error.message
        });
    }
}));
AK01Controller.deleteAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID diperlukan'
        });
    }
    try {
        yield ak_01_service_1.AK01Service.deleteAK01(id);
        res.status(200).json({
            success: true,
            message: 'AK01 berhasil dihapus'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus AK01',
            error: error.message
        });
    }
}));
AK01Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (isNaN(resultId)) {
        res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
        return;
    }
    try {
        const result = yield ak_01_service_1.AK01Service.approvedByAssessor(resultId);
        res.status(200).json({
            success: true,
            message: 'AK01 berhasil disetujui',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menyetujui AK01',
            error: error.message
        });
    }
}));
AK01Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    if (isNaN(resultId)) {
        res.status(400).json({
            success: false,
            message: 'Result ID diperlukan'
        });
        return;
    }
    try {
        const result = yield ak_01_service_1.AK01Service.approvedByAssessee(resultId);
        res.status(200).json({
            success: true,
            message: 'AK01 berhasil disetujui',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menyetujui AK01',
            error: error.message
        });
    }
}));
