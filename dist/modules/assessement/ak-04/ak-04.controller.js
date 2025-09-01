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
exports.AK04Controller = void 0;
const async_handler_1 = require("../../../common/async.handler");
const ak_04_service_1 = require("./ak-04.service");
class AK04Controller {
}
exports.AK04Controller = AK04Controller;
AK04Controller.createAK04 = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield ak_04_service_1.AK04Service.createAK04(req.body);
            res.status(201).json({
                success: true,
                message: 'AK-04 berhasil dibuat',
                data: data,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal membuat AK-04',
                error: error.message,
            });
        }
    });
});
AK04Controller.getAK04ByResultId = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resultId = Number(req.params.resultId);
            if (!resultId) {
                return res.status(400).json({
                    success: false,
                    message: 'Result ID diperlukan',
                });
            }
            const data = yield ak_04_service_1.AK04Service.getAK04ByResultId(resultId);
            res.status(200).json({
                success: true,
                message: 'AK-04 fetched',
                data: data,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil AK-04',
                error: error.message,
            });
        }
    });
});
AK04Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resultId = Number(req.params.resultId);
            if (!resultId) {
                return res.status(400).json({
                    success: false,
                    message: 'Result ID diperlukan',
                });
            }
            const data = yield ak_04_service_1.AK04Service.approvedByAssessee(resultId);
            res.status(200).json({
                success: true,
                message: 'AK-04 berhasil disetujui',
                data: data,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal menyetujui AK-04',
                error: error.message,
            });
        }
    });
});
