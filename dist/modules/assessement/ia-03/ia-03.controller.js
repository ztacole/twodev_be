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
exports.IA03Controller = void 0;
const ia_03_service_1 = require("./ia-03.service");
const async_handler_1 = require("../../../common/async.handler");
class IA03Controller {
}
exports.IA03Controller = IA03Controller;
_a = IA03Controller;
IA03Controller.getIA03Groups = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const iaGroups = yield ia_03_service_1.IA03Service.getIA03Groups(resultId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA03Controller.sendResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ia_03_service_1.IA03Service.sendResult(data);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil dikirimkan',
        data: result
    });
}));
IA03Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_03_service_1.IA03Service.approvedByAssessor(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil disetujui',
        data: result
    });
}));
IA03Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_03_service_1.IA03Service.approvedByAssessee(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil disetujui',
        data: result
    });
}));
IA03Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_03_service_1.IA03Service.getResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result
    });
}));
