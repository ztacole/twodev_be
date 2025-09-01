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
exports.IA02Controller = void 0;
const ia_02_service_1 = require("./ia-02.service");
const async_handler_1 = require("../../../common/async.handler");
class IA02Controller {
}
exports.IA02Controller = IA02Controller;
_a = IA02Controller;
IA02Controller.getIA02Groups = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) {
        return res.status(400).json({ success: false, message: 'Assessment ID is required' });
    }
    const iaGroups = yield ia_02_service_1.IAO2Service.getIA02Groups(assessmentId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA02Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const iaGroups = yield ia_02_service_1.IAO2Service.approveByAssessor(resultId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA02Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const iaGroups = yield ia_02_service_1.IAO2Service.approveByAssessee(resultId);
    res.status(200).json({
        success: true,
        message: 'Group IA berhasil diambil',
        data: iaGroups
    });
}));
IA02Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_02_service_1.IAO2Service.getResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result
    });
}));
