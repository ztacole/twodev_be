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
exports.IA05Controller = void 0;
const ia_05_service_1 = require("./ia-05.service");
const async_handler_1 = require("../../../common/async.handler");
class IA05Controller {
}
exports.IA05Controller = IA05Controller;
_a = IA05Controller;
IA05Controller.getQuestions = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) {
        return res.status(400).json({ success: false, message: 'Assessment ID is required' });
    }
    const questions = yield ia_05_service_1.IA05Service.getQuestions(assessmentId);
    res.status(200).json({
        success: true,
        message: 'Pertanyaan berhasil diambil',
        data: questions
    });
}));
IA05Controller.getAnswerKeys = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) {
        return res.status(400).json({ success: false, message: 'Assessment ID is required' });
    }
    const answers = yield ia_05_service_1.IA05Service.getAnswerKeys(assessmentId);
    res.status(200).json({
        success: true,
        message: 'Kunci Jawaban berhasil diambil',
        data: answers
    });
}));
IA05Controller.getAssesseeAnswers = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const answers = yield ia_05_service_1.IA05Service.getAssesseeAnswers(resultId);
    res.status(200).json({
        success: true,
        message: 'Jawaban berhasil diambil',
        data: answers
    });
}));
IA05Controller.sendAssesseeResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ia_05_service_1.IA05Service.sendAssesseeResult(data);
    res.status(200).json({
        success: true,
        message: 'Jawaban berhasil dikirimkan',
        data: result
    });
}));
IA05Controller.sendAssessorResult = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ia_05_service_1.IA05Service.sendAssessorResult(data);
    res.status(200).json({
        success: true,
        message: 'Jawaban berhasil dikirimkan',
        data: result
    });
}));
IA05Controller.approvedByAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_05_service_1.IA05Service.approvedByAssessor(resultId);
    res.status(200).json({
        success: true,
        message: 'Tanda tangan berhasil dikirimkan',
        data: result
    });
}));
IA05Controller.approvedByAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_05_service_1.IA05Service.approvedByAssessee(resultId);
    res.status(200).json({
        success: true,
        message: 'Tanda tangan berhasil dikirimkan',
        data: result
    });
}));
IA05Controller.getResultDetails = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    if (!resultId) {
        return res.status(400).json({ success: false, message: 'Result ID is required' });
    }
    const result = yield ia_05_service_1.IA05Service.getResultDetails(resultId);
    res.status(200).json({
        success: true,
        message: 'Hasil berhasil diambil',
        data: result
    });
}));
