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
exports.embedQrCode = embedQrCode;
const qrCode_helper_1 = require("./qrCode.helper");
/**
 * Embeds a QR code into a PDF document as a PNG image.
 *
 * @param pdfDoc The PDF document instance to embed the QR code into.
 * @param data The data string to encode into the QR code.
 *
 * @returns A PDFImage instance representing the embedded QR code,
 *          which can be drawn on a PDF page using `page.drawImage`.
 */
function embedQrCode(pdfDoc, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const qrImageBytes = yield (0, qrCode_helper_1.generateQrBytes)(data);
        return yield pdfDoc.embedPng(qrImageBytes);
    });
}
