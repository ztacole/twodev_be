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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedQrCode = embedQrCode;
exports.kopSurat = kopSurat;
// qrCode.helper.ts
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const qrCode_helper_1 = require("./qrCode.helper");
const pdfDraw_helper_1 = require("./pdfDraw.helper");
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
function kopSurat(pdfDoc, page, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { imagePath = path_1.default.join(__dirname, "../../../public/images/kop-surat.png"), type = "png", marginX = 40, marginTop = 100, height = 80, } = options || {};
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const icon = yield (0, pdfDraw_helper_1.loadAndEmbedImage)(pdfDoc, imagePath, type);
        const startY = pageHeight - marginTop;
        page.drawImage(icon, {
            x: marginX,
            y: startY,
            width: pageWidth - marginX * 2,
            height,
        });
        let yK = startY - 6;
        page.drawLine({
            start: { x: marginX, y: yK },
            end: { x: pageWidth - marginX, y: yK },
            thickness: 2,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawLine({
            start: { x: marginX, y: yK - 2 },
            end: { x: pageWidth - marginX, y: yK - 2 },
            thickness: 0,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        return yK - 20;
    });
}
