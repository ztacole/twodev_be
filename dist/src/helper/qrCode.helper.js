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
exports.generateQrDataURL = generateQrDataURL;
exports.generateQrBase64 = generateQrBase64;
exports.generateQrBytes = generateQrBytes;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Generates a QR code as a DataURL (base64 string with `data:image/png;base64,` prefix).
 *
 * @param data The data string to encode into the QR code.
 * @param margin The margin (quiet zone) around the QR code. Default is 1.
 *
 * @returns A DataURL string representing the generated QR code image.
 */
function generateQrDataURL(data_1) {
    return __awaiter(this, arguments, void 0, function* (data, margin = 1) {
        return yield qrcode_1.default.toDataURL(data, { margin });
    });
}
/**
 * Generates a QR code as a pure base64 string (without the `data:image/png;base64,` prefix).
 *
 * @param data The data string to encode into the QR code.
 * @param margin The margin (quiet zone) around the QR code. Default is 1.
 *
 * @returns A base64 string representing the generated QR code image.
 */
function generateQrBase64(data_1) {
    return __awaiter(this, arguments, void 0, function* (data, margin = 1) {
        const dataURL = yield generateQrDataURL(data, margin);
        return dataURL.split(",")[1];
    });
}
/**
 * Generates a QR code as a Uint8Array of image bytes.
 *
 * @param data The data string to encode into the QR code.
 * @param margin The margin (quiet zone) around the QR code. Default is 1.
 *
 * @returns A Uint8Array containing the raw PNG image bytes of the QR code.
 */
function generateQrBytes(data_1) {
    return __awaiter(this, arguments, void 0, function* (data, margin = 1) {
        const base64 = yield generateQrBase64(data, margin);
        return Uint8Array.from(Buffer.from(base64, "base64"));
    });
}
