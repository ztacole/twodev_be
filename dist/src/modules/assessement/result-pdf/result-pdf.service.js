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
exports.ResultPdfService = void 0;
const pdf_lib_1 = require("pdf-lib");
const ia_01_service_1 = require("../ia-01/ia-01.service");
const helper_1 = require("./helper");
const headerImage = "../../public/images/kop-surat-lsp-smkn24j.png";
class ResultPdfService {
    static generateIA01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold);
            const resultDetails = yield ia_01_service_1.IA01Service.getResultDetails(resultId);
            const groups = yield ia_01_service_1.IA01Service.getIA01Groups(resultId);
            // ==== TITLE ====
            page.drawText("FR.IA.01.CL - CEKLIS OBSERVASI AKTIVITAS DI TEMPAT KERJA ATAU TEMPAT KERJA SIMULASI", { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 });
            y -= 30;
            // ==== INFO SKEMA ====
            const info = [
                ["Judul", ":", (_c = (_b = (_a = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _a === void 0 ? void 0 : _a.occupation) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : "-"],
                ["Nomor", ":", (_e = (_d = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _d === void 0 ? void 0 : _d.code) !== null && _e !== void 0 ? _e : "-"],
                ["TUK", ":", (_f = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.tuk) !== null && _f !== void 0 ? _f : "-"],
                ["Nama Assesor", ":", (_h = (_g = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessor) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : "-"],
                ["Nama Asesi", ":", (_k = (_j = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessee) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : "-"],
                ["Tanggal", ":", (_m = (_l = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.created_at) === null || _l === void 0 ? void 0 : _l.toLocaleString()) !== null && _m !== void 0 ? _m : "-"],
            ];
            y = yield (0, helper_1.drawCertificateLayout)(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
            y -= 40;
            // ==== LOOP GROUPS ====
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                if (y < 150) {
                    ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                }
                y = yield (0, helper_1.drawUnitGroupLayout)(page, i, group, 40, y, 20, font, fontBold);
                y -= 20;
                // Loop unit
                for (const unit of group.units) {
                    // Ambil elemen dan detail dari unit
                    y = yield (0, helper_1.drawUnitLayout)(page, i, unit.unit_code, unit.title, 40, y, 20, font, fontBold);
                    y -= 20;
                    const elements = yield ia_01_service_1.IA01Service.getElementsByUnitId(resultId, unit.id);
                    // const header = [["No", "Elemen", "Kriteria Unjuk Kerja", "Standar", "Ya", "Tidak"]];
                    // const rows: string[][] = [];
                    // elements.forEach((el, elIdx) => {
                    //     el.details.forEach((detail, detIdx) => {
                    //         rows.push([
                    //             `${elIdx + 1}.${detIdx + 1}`,
                    //             el.title,
                    //             detail.description,
                    //             detail.benchmark,
                    //             detail.result?.is_competent ? "V" : "",
                    //             detail.result && !detail.result.is_competent ? "V" : "",
                    //         ]);
                    //     });
                    // });
                    if (y < 150) {
                        ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                    }
                    y = yield (0, helper_1.drawElementLayout)(page, elements, 40, y, font, fontBold);
                    y -= 20;
                }
            }
            return yield pdfDoc.save();
        });
    }
}
exports.ResultPdfService = ResultPdfService;
