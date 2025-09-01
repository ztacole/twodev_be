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
exports.AK03Controller = void 0;
const async_handler_1 = require("../../../common/async.handler");
const ak_03_service_1 = require("./ak-03.service");
class AK03Controller {
}
exports.AK03Controller = AK03Controller;
AK03Controller.createAK03 = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield ak_03_service_1.AK03Service.createAK03(req.body);
            res.status(201).json({
                success: true,
                message: 'AK-03 berhasil dibuat',
                data: data,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal membuat AK-03',
                error: error.message,
            });
        }
    });
});
AK03Controller.getAK03ByResultId = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { result_id } = req.params;
            const data = yield ak_03_service_1.AK03Service.getAK03ByResultId(Number(result_id));
            if (!data) {
                return res.status(404).json({ success: false, message: 'AK-03 tidak ditemukan' });
            }
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil AK-03',
                error: error.message,
            });
        }
    });
});
