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
exports.APL02Controller = void 0;
const apl_02_service_1 = require("./apl-02.service");
const async_handler_1 = require("../../../common/async.handler");
class APL02Controller {
}
exports.APL02Controller = APL02Controller;
_a = APL02Controller;
APL02Controller.getUnitsAPL02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        throw new Error('Result ID is required');
    }
    const unitCompetencies = yield apl_02_service_1.APL02Service.getUnitsAPL02(resultId);
    res.status(200).json({
        success: true,
        message: 'Unit kompetensi berhasil diambil',
        data: unitCompetencies,
    });
}));
APL02Controller.getElementsByUnitId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    const unitId = Number(req.params.unitId);
    if (!resultId || !unitId) {
        throw new Error('Result ID and Unit ID are required');
    }
    const elements = yield apl_02_service_1.APL02Service.getElementsByUnitId(resultId, unitId);
    res.status(200).json({
        success: true,
        message: 'Elemen berhasil diambil',
        data: elements,
    });
}));
APL02Controller.sendResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield apl_02_service_1.APL02Service.sendResult(data);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil dikirimkan',
        data: result,
    });
}));
APL02Controller.sendResultHeader = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield apl_02_service_1.APL02Service.sendResultHeader(data);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil dikirimkan',
        data: result,
    });
}));
APL02Controller.getUnitsResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    const result = yield apl_02_service_1.APL02Service.getUnitsResult(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result,
    });
}));
APL02Controller.getElementsResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    const unitId = Number(req.params.unitId);
    if (!resultId || !unitId) {
        throw new Error('Result ID and Unit ID are required');
    }
    const result = yield apl_02_service_1.APL02Service.getElementsResult(resultId, unitId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result,
    });
}));
APL02Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID is required',
        });
    }
    const data = req.body;
    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Data harus diisi',
        });
    }
    const result = yield apl_02_service_1.APL02Service.approvedByAssessor(resultId, data);
    res.status(200).json({
        success: true,
        message: 'Assessor telah tanda tangan!',
        data: result,
    });
}));
APL02Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID is required',
        });
    }
    const result = yield apl_02_service_1.APL02Service.approvedByAssessee(resultId);
    res.status(200).json({
        success: true,
        message: 'Assessee telah tanda tangan!',
        data: result,
    });
}));
APL02Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({
            success: false,
            message: 'Result ID is required',
        });
    }
    const result = yield apl_02_service_1.APL02Service.getResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result,
    });
}));
