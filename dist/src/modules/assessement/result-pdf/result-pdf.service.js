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
const date_helper_1 = require("../../../helper/date.helper");
const pdfDraw_helper_1 = require("../../../helper/pdfDraw.helper");
const apl_01_service_1 = require("../apl-01/apl-01.service");
const asseessee_service_1 = require("../../assessee/asseessee.service");
const headerImage = "../../public/images/kop-surat-lsp-smkn24j.png";
class ResultPdfService {
    static generateIA01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
                ["Tanggal", ":", ((_l = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _l === void 0 ? void 0 : _l.created_at) ? `${(0, date_helper_1.formatDay)(resultDetails.assessment.created_at)}, ${(0, date_helper_1.formatDate)(resultDetails.assessment.created_at)}` : "-"],
            ];
            y = yield (0, helper_1.drawCertificateLayout)(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
            // ==== LOOP GROUPS ====
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                if (y < 150) {
                    ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                }
                y = yield (0, helper_1.drawUnitGroupLayout)(page, i, group, 40, y, 20, font, fontBold);
                // Loop unit
                let unitIdx = 0;
                for (const unit of group.units) {
                    y -= 20;
                    y = yield (0, helper_1.drawUnitLayout)(page, ++unitIdx, unit.unit_code, unit.title, 40, y, 20, font, fontBold);
                    y -= 20;
                    const elements = yield ia_01_service_1.IA01Service.getElementsByUnitId(resultId, unit.id);
                    if (y < 150) {
                        ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                    }
                    y = yield (0, helper_1.drawElementLayout)(page, elements, 40, y, font, fontBold);
                }
            }
            ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            y = yield (0, helper_1.drawFeedbackIA01)(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);
            return yield pdfDoc.save();
        });
    }
    static generateAPL01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const fontIcon = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.ZapfDingbats);
            const FONTS = { s: 9, m: 10, l: 12 };
            const GAPS = { s: 5, m: 10, l: 15 };
            let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold);
            // Fetch data
            const resultDetails = yield apl_01_service_1.APL1Service.getResultDetails(resultId);
            const assessee = yield asseessee_service_1.AssesseeService.getAssesseeById((resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.id) || 0);
            let gender = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.gender.toLowerCase();
            if (gender === "female") {
                gender = 'Perempuan';
            }
            else if (gender === "male") {
                gender = 'Laki-laki';
            }
            else {
                throw new Error(`Gender ${gender} tidak diketahui`);
            }
            // ==== TITLE ====
            page.drawText("FR.APL.01. PERMOHONAN SERTIFIKASI KOMPETENSI", { x: 40, y, size: FONTS.l, font: fontBold, maxWidth: 520, lineHeight: 16 });
            y -= 30;
            // ==== SECTION 1 ====
            page.drawText("Bagian 1 : Rincian Data Pemohon Sertifikasi", { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 20;
            page.drawText("a. Data Pribadi", { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 15;
            y = (0, pdfDraw_helper_1.drawField)(page, "Nama Lengkap", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.full_name}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "NIK", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.identity_number}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Tempat / Tanggal Lahir ", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.birth_location} / ${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.birth_date}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Jenis Kelamin", `${gender}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Kewarganegaraan", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.nationality}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Alamat Rumah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.address}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "No Hp", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.phone_no}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Email", `${assessee === null || assessee === void 0 ? void 0 : assessee.email.toLowerCase()}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Kualifikasi Pendidikan ", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.educational_qualifications}`, 40, y, font, FONTS.s);
            y -= 20;
            page.drawText("b. Data Sekolah", { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 15;
            y = (0, pdfDraw_helper_1.drawField)(page, "Nama Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.institution_name}`, 40, y, font, FONTS.s);
            // y = drawField(page, "Konsentrasi Keahlian", `${resultDetails?.job.work_unit}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Alamat Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.address}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "No Telpon Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.phone_no}`, 40, y, font, FONTS.s);
            y = (0, pdfDraw_helper_1.drawField)(page, "Email Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.job_email}`, 40, y, font, FONTS.s);
            // === PAGE BREAK ===
            ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            // ==== SECTION 2 ====
            page.drawText("Bagian 2 : Data Sertifikasi", { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 20;
            // ==== INFO SKEMA ====
            const info = [
                ["Judul", ":", (_c = (_b = (_a = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _a === void 0 ? void 0 : _a.occupation) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : "-"],
                ["Nomor", ":", (_e = (_d = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _d === void 0 ? void 0 : _d.code) !== null && _e !== void 0 ? _e : "-"],
                ["Tujuan Asesmen", ":", `Sertifikasi`],
                ["Tujuan Asesmen", ":", `Pengakuan Kompetensi Terkini (PKT)`],
                ["Tujuan Asesmen", ":", `Rekognisi Pembelajaran Lampau (RPL)`],
                ["Tujuan Asesmen", ":", `Lainnya`],
            ];
            y = yield (0, helper_1.drawCertificateLayout)(page, info, [132, 11, 377], 40, y, 20, font, font);
            y -= 30;
            page.drawText("Daftar Unit Kompetensi sesuai kemasan:", { x: 40, y, size: FONTS.s, font: font, maxWidth: 520, lineHeight: 14 });
            y -= 20;
            drawSchemeTableHeader(page, y, resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment, fontBold, FONTS.s, (0, pdf_lib_1.rgb)(0, 0, 0));
            y -= 80;
            drawUnitTable(page, y, ((_f = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _f === void 0 ? void 0 : _f.uc_apl02s) || [], font, fontBold, FONTS.s, (0, pdf_lib_1.rgb)(0, 0, 0));
            // === PAGE BREAK ===
            ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            // ==== SECTION 3 ====
            page.drawText("Bagian 2 : Data Sertifikasi", { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 20;
            page.drawText("3.1. Bukti Persyaratan Dasar Pemohon", { x: 40, y, size: FONTS.s, font: fontBold });
            y -= 10;
            y = yield (0, helper_1.drawChecklistTable)(page, [
                { label: "Rapor Semester 1 s.d. 5", memenuhi: true },
                { label: "Sertifikat Praktek Kerja Lapangan (PKL)", memenuhi: true },
            ], 40, y, 20, font, fontIcon);
            y -= 25;
            page.drawText("3.2. Bukti Administratif", { x: 40, y, size: FONTS.s, font: fontBold });
            y -= 10;
            y = yield (0, helper_1.drawChecklistTable)(page, [
                { label: "Kartu Keluarga", memenuhi: true },
                { label: "Foto", memenuhi: true },
            ], 40, y, 20, font, fontIcon);
            y -= 20;
            return yield pdfDoc.save();
            function drawSchemeTableHeader(page, y, data, fontBold, fontSize, color) {
                const w = page.getWidth() - 80;
                const x = 40;
                page.drawRectangle({ x, y: y - 60, width: 90, height: 60, borderColor: color, borderWidth: 1 });
                let yText = y - 15;
                yText = (0, pdfDraw_helper_1.drawParagraph)(page, "SKEMA", 50, yText - 4, fontBold, fontSize, "left", undefined, 80);
                yText = (0, pdfDraw_helper_1.drawParagraph)(page, "SERTIFIKASI", 50, yText, fontBold, fontSize, "left", undefined, 80);
                yText = (0, pdfDraw_helper_1.drawParagraph)(page, "OKUPASI", 50, yText, fontBold, fontSize, "left", undefined, 80);
                ["JUDUL", "NOMOR"].forEach((text, i) => {
                    const yOffset = y - 30 * (i + 1);
                    page.drawRectangle({ x: 130, y: yOffset, width: 80, height: 30, borderColor: color, borderWidth: 1 });
                    (0, pdfDraw_helper_1.drawParagraph)(page, text, 142, yOffset + 10, fontBold, fontSize);
                    (0, pdfDraw_helper_1.drawParagraph)(page, ":", 198, yOffset + 10, fontBold, fontSize);
                });
                ["name", "code"].forEach((field, i) => {
                    var _a, _b;
                    page.drawRectangle({
                        x: 190,
                        y: y - 30 * (i + 1),
                        width: w - 150,
                        height: 30,
                        borderColor: color,
                        borderWidth: 1,
                    });
                    const value = field === "name" ? (_b = (_a = data === null || data === void 0 ? void 0 : data.occupation) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toUpperCase() : (data === null || data === void 0 ? void 0 : data.code) || "-";
                    (0, pdfDraw_helper_1.drawParagraph)(page, value, 215, y - 20 - 30 * i, fontBold, fontSize);
                });
            }
            function drawUnitTable(page, y, data, font, fontBold, fontSize, color) {
                const x = 40;
                const width = page.getWidth() - 80;
                const rowHeight = 20;
                const col = { no: 30, code: 120, title: width - 150 };
                // Header
                page.drawRectangle({ x, y: y - rowHeight, width, height: rowHeight, borderColor: color, borderWidth: 1 });
                page.drawRectangle({ x: x + col.no, y: y - rowHeight, width: col.code, height: rowHeight, borderColor: color, borderWidth: 1 });
                page.drawRectangle({ x: x + col.no + col.code, y: y - rowHeight, width: col.title, height: rowHeight, borderColor: color, borderWidth: 1 });
                (0, pdfDraw_helper_1.drawParagraph)(page, "NO", x + 10, y - 15, fontBold, fontSize);
                (0, pdfDraw_helper_1.drawParagraph)(page, "KODE UNIT", x + col.no + 10, y - 15, fontBold, fontSize);
                (0, pdfDraw_helper_1.drawParagraph)(page, "JUDUL UNIT", x + col.no + col.code + 10, y - 15, fontBold, fontSize);
                // Rows
                data.forEach((result, i) => {
                    const rowY = y - rowHeight - (i + 1) * rowHeight;
                    page.drawRectangle({ x, y: rowY, width, height: rowHeight, borderColor: color, borderWidth: 1 });
                    page.drawLine({ start: { x: x + col.no, y: rowY }, end: { x: x + col.no, y: rowY + rowHeight }, thickness: 1, color });
                    page.drawLine({ start: { x: x + col.no + col.code, y: rowY }, end: { x: x + col.no + col.code, y: rowY + rowHeight }, thickness: 1, color });
                    (0, pdfDraw_helper_1.drawParagraph)(page, `${i + 1}`, x + 10, rowY + 5, font, fontSize);
                    (0, pdfDraw_helper_1.drawParagraph)(page, `${(result === null || result === void 0 ? void 0 : result.unit_code) || "-"}`, x + col.no + 10, rowY + 5, font, fontSize);
                    (0, pdfDraw_helper_1.drawParagraph)(page, `${(result === null || result === void 0 ? void 0 : result.title) || "-"}`, x + col.no + col.code + 10, rowY + 5, font, fontSize);
                });
            }
        });
    }
}
exports.ResultPdfService = ResultPdfService;
