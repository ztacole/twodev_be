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
exports.IA01Controller = void 0;
const ia_01_service_1 = require("./ia-01.service");
const async_handler_1 = require("../../../common/async.handler");
class IA01Controller {
}
exports.IA01Controller = IA01Controller;
_a = IA01Controller;
IA01Controller.getIA01Groups = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const iaGroups = yield ia_01_service_1.IA01Service.getIA01Groups(resultId);
    res.status(200).json({ success: true, message: 'Group IA berhasil diambil', data: iaGroups });
}));
IA01Controller.getElementsByUnitId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    const unitId = Number(req.params.unitId);
    if (!resultId || !unitId) {
        return res.status(400).json({ success: false, message: 'Result ID and Unit ID are required' });
    }
    const elements = yield ia_01_service_1.IA01Service.getElementsByUnitId(resultId, unitId);
    res.status(200).json({ success: true, message: 'Elemen berhasil diambil', data: elements });
}));
IA01Controller.sendResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ia_01_service_1.IA01Service.sendResult(data);
    res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
}));
IA01Controller.sendResultHeader = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ia_01_service_1.IA01Service.sendResultHeader(data);
    res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
}));
IA01Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_01_service_1.IA01Service.approvedByAssessor(resultId);
    res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
}));
IA01Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_01_service_1.IA01Service.approvedByAssessee(resultId);
    res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
}));
IA01Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_01_service_1.IA01Service.getResultDetails(resultId);
    res.status(200).json({ success: true, message: 'Hasil berhasil diambil', data: result });
}));
IA01Controller.getIncompleteCriterias = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const incompleteCriterias = yield ia_01_service_1.IA01Service.getIncompleteCriterias(resultId);
    res.status(200).json({ success: true, message: 'Hasil berhasil diambil', data: incompleteCriterias });
}));
