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
exports.ResultPdfController = void 0;
const result_pdf_service_1 = require("./result-pdf.service");
const async_handler_1 = require("../../../common/async.handler");
class ResultPdfController {
}
exports.ResultPdfController = ResultPdfController;
_a = ResultPdfController;
ResultPdfController.generateIA01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    const pdfBytes = yield result_pdf_service_1.ResultPdfService.generateIA01(resultId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=\"IA-01.pdf\"");
    res.send(Buffer.from(pdfBytes));
}));
ResultPdfController.generateAPL01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = Number(req.params.resultId);
    const pdfBytes = yield result_pdf_service_1.ResultPdfService.generateAPL01(resultId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=\"APL-01.pdf\"");
    res.send(Buffer.from(pdfBytes));
}));
