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
exports.AK05Controller = void 0;
const async_handler_1 = require("../../../common/async.handler");
const ak_05_service_1 = require("./ak-05.service");
class AK05Controller {
}
exports.AK05Controller = AK05Controller;
AK05Controller.createAK05 = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield ak_05_service_1.AK05Service.createAK05(req.body);
            res.status(201).json({
                success: true,
                message: 'AK-05 created',
                data: data,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal membuat AK-05',
                error: error.message,
            });
        }
    });
});
AK05Controller.getAK05ByResultId = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { result_id } = req.params;
            if (!result_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Result ID diperlukan'
                });
            }
            const data = yield ak_05_service_1.AK05Service.getAK05ByResultId(Number(result_id));
            if (!data) {
                return res.status(404).json({ success: false, message: 'AK-05 tidak ditemukan' });
            }
            res.json({
                success: true, data
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil AK-05',
                error: error.message,
            });
        }
    });
});
AK05Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { resultId } = req.params;
            if (!resultId) {
                return res.status(400).json({
                    success: false,
                    message: 'Result ID diperlukan'
                });
            }
            const data = yield ak_05_service_1.AK05Service.approvedByAssessor(Number(resultId));
            res.json({
                success: true,
                message: 'AK-05 berhasil disetujui',
                data: data
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal menyetujui AK-05',
                error: error.message,
            });
        }
    });
});
