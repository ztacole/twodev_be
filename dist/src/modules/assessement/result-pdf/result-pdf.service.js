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
const ak_02_service_1 = require("../ak-02/ak-02.service");
const ak_01_service_1 = require("../ak-01/ak-01.service");
const apl_02_service_1 = require("../apl-02/apl-02.service");
const BASE_MARGIN = 150;
const ELEMENT_ROW_HEIGHT = 20;
const headerImage = "../../public/images/kop-surat-lsp-smkn24j.png";
class ResultPdfService {
    static generateApl02(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold);
            const resultDetails = yield apl_02_service_1.APL02Service.getResultDetails(resultId);
            // ==== TITLE ====
            page.drawText("FR.APL.02 - ASESMEN MANDIRI", { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 });
            y -= 30;
            // ==== INFO SKEMA ====
            const info = [
                ["Judul", ":", (_c = (_b = (_a = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _a === void 0 ? void 0 : _a.occupation) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : "-"],
                ["Nomor", ":", (_e = (_d = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _d === void 0 ? void 0 : _d.code) !== null && _e !== void 0 ? _e : "-"],
                ["TUK", ":", (_f = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.tuk) !== null && _f !== void 0 ? _f : "-"],
                ["Nama Assesor", ":", (_h = (_g = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessor) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : "-"],
                ["Nama Asesee", ":", (_k = (_j = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessee) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : "-"],
                ["Tanggal", ":", (_l = (0, date_helper_1.formatDate)(resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.created_at)) !== null && _l !== void 0 ? _l : "-"],
            ];
            y = yield (0, helper_1.drawCertificateLayout)(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
            y -= 30;
            // ==== LOOP UNIT KOMPETENSI ====
            const units = yield apl_02_service_1.APL02Service.getUnitsAPL02(resultId);
            for (let i = 0; i < units.length; i++) {
                const unit = units[i];
                const elements = yield apl_02_service_1.APL02Service.getElementsByUnitId(resultId, unit.id);
                if (y < BASE_MARGIN) {
                    ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                }
                y = yield (0, helper_1.drawUnitLayout)(page, i + 1, unit.unit_code, unit.title, 40, y, 20, font, fontBold);
                ({ page, y } = yield (0, helper_1.drawElementApl02Layout)(pdfDoc, page, i + 1, elements, 40, y, font, fontBold, headerImage, BASE_MARGIN));
                y -= 20;
            }
            y -= 20;
            if (y < BASE_MARGIN + 260) {
                ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            }
            y = yield (0, helper_1.drawFeedbackAPL02)(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);
            return yield pdfDoc.save();
        });
    }
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
                if (y < BASE_MARGIN) {
                    ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                }
                y = yield (0, helper_1.drawUnitGroupLayout)(page, pdfDoc, i, group, 40, y, 20, font, fontBold);
                let unitIdx = 0;
                for (const unit of group.units) {
                    const elements = yield ia_01_service_1.IA01Service.getElementsByUnitId(resultId, unit.id);
                    // Page break
                    if (y < BASE_MARGIN) {
                        ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
                    }
                    // Draw unit
                    y -= 20;
                    y = yield (0, helper_1.drawUnitLayout)(page, ++unitIdx, unit.unit_code, unit.title, 40, y, 20, font, fontBold);
                    // Draw elements
                    y -= 20;
                    ({ page, y } = yield (0, helper_1.drawElementIa01Layout)(pdfDoc, page, elements, 40, y, font, fontBold, headerImage, BASE_MARGIN));
                }
            }
            if (y < BASE_MARGIN + 470) {
                ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            }
            y = yield (0, helper_1.drawFeedbackIA01)(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);
            return yield pdfDoc.save();
        });
    }
    static generateAPL01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const fontIcon = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.ZapfDingbats);
            const FONTS = { s: 9, m: 10, l: 12 };
            // const GAPS = { s: 5, m: 10, l: 15 };
            let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold);
            // Fetch data
            const resultDetails = yield apl_01_service_1.APL1Service.getResultDetails(resultId);
            const assessee = yield asseessee_service_1.AssesseeService.getAssesseeById(resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.id);
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
            page.drawText("Bagian 1 : Rincian Data Pemohon Sertifikasi", { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 20;
            page.drawText("a. Data Pribadi", { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 15;
            y = (0, pdfDraw_helper_1.drawField)(page, "Nama Lengkap", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.full_name}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "NIK", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.identity_number}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Tempat / Tanggal Lahir ", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.birth_location} / ${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.birth_date}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Jenis Kelamin", `${gender}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Kewarganegaraan", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.nationality}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Alamat Rumah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.address}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "No Hp", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.phone_no}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Email", `${assessee === null || assessee === void 0 ? void 0 : assessee.email.toLowerCase()}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Kualifikasi Pendidikan ", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.educational_qualifications}`, 40, y, font, FONTS.m);
            y -= 20;
            page.drawText("b. Data Sekolah", { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 15;
            y = (0, pdfDraw_helper_1.drawField)(page, "Nama Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.institution_name}`, 40, y, font, FONTS.m);
            // y = drawField(page, "Konsentrasi Keahlian", `${resultDetails?.job.work_unit}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Alamat Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.address}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "No Telpon Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.phone_no}`, 40, y, font, FONTS.m);
            y = (0, pdfDraw_helper_1.drawField)(page, "Email Sekolah", `${resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.job.job_email}`, 40, y, font, FONTS.m);
            // === PAGE BREAK ===
            ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            // ==== SECTION 2 ====
            page.drawText("Bagian 2 : Data Sertifikasi", { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 });
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
            page.drawText("Daftar Unit Kompetensi sesuai kemasan:", { x: 40, y, size: FONTS.m, font: font, maxWidth: 520, lineHeight: 14 });
            y -= 10;
            drawSchemeTableHeader(page, y, resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment, fontBold, FONTS.s, (0, pdf_lib_1.rgb)(0, 0, 0));
            y -= 60;
            ({ page, y } = yield drawUnitTable(page, pdfDoc, y, ((_f = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _f === void 0 ? void 0 : _f.uc_apl02s) || [], font, fontBold, FONTS.s, (0, pdf_lib_1.rgb)(0, 0, 0)));
            // === PAGE BREAK ===
            ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            // ==== SECTION 3 ====
            page.drawText("Bagian 2 : Data Sertifikasi", { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 });
            y -= 20;
            page.drawText("3.1. Bukti Persyaratan Dasar Pemohon", { x: 40, y, size: FONTS.s, font: fontBold });
            y -= 10;
            y = yield (0, helper_1.drawChecklistTable)(page, [
                Object.assign({ label: "Rapor Semester 1 s.d. 5" }, docStatus((_g = resultDetails.resultDoc) === null || _g === void 0 ? void 0 : _g.school_report_card)),
                Object.assign({ label: "Sertifikat Praktek Kerja Lapangan (PKL)" }, docStatus((_h = resultDetails.resultDoc) === null || _h === void 0 ? void 0 : _h.field_work_practice_certificate)),
            ], 40, y, 20, font, fontIcon);
            y -= 25;
            page.drawText("3.2. Bukti Administratif", { x: 40, y, size: FONTS.s, font: fontBold });
            y -= 10;
            y = yield (0, helper_1.drawChecklistTable)(page, [
                Object.assign({ label: "Kartu Pelajar" }, docStatus((_j = resultDetails.resultDoc) === null || _j === void 0 ? void 0 : _j.student_card)),
                Object.assign({ label: "Kartu Keluarga" }, docStatus((_k = resultDetails.resultDoc) === null || _k === void 0 ? void 0 : _k.family_card)),
                Object.assign({ label: "Foto" }, docStatus((_l = resultDetails.resultDoc) === null || _l === void 0 ? void 0 : _l.id_card)),
            ], 40, y, 20, font, fontIcon);
            y -= 20;
            yield (0, helper_1.drawSignatureAPL01)(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);
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
                        width: w - BASE_MARGIN,
                        height: 30,
                        borderColor: color,
                        borderWidth: 1,
                    });
                    const value = field === "name" ? (_b = (_a = data === null || data === void 0 ? void 0 : data.occupation) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toUpperCase() : (data === null || data === void 0 ? void 0 : data.code) || "-";
                    (0, pdfDraw_helper_1.drawParagraph)(page, value, 215, y - 20 - 30 * i, fontBold, fontSize);
                });
            }
            function drawUnitTable(page, pdfDoc, y, data, font, fontBold, fontSize, color) {
                const x = 40;
                const width = page.getWidth() - 80;
                const rowHeight = 20;
                const col = { no: 30, code: 120, title: width - BASE_MARGIN };
                const colArray = [col.no, col.code, col.title];
                const tableData = [
                    ["NO", "KODE UNIT", "JUDUL UNIT"],
                    ...data.map((result, i) => [
                        `${i + 1}`,
                        `${(result === null || result === void 0 ? void 0 : result.unit_code) || "-"}`,
                        `${(result === null || result === void 0 ? void 0 : result.title) || "-"}`,
                    ])
                ];
                return (0, helper_1.drawTable)(page, pdfDoc, tableData, colArray, x, y - rowHeight, rowHeight, font, fontBold, BASE_MARGIN, fontSize, "left");
            }
            function docStatus(file) {
                if (file) {
                    return { memenuhi: true, tidakMemenuhi: false, tidakAda: false };
                }
                return { memenuhi: false, tidakMemenuhi: false, tidakAda: true };
            }
        });
    }
    static generateAK01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold);
            const resultDetails = yield ak_01_service_1.AK01Service.getDataForAK01(resultId);
            // === TITLE ===
            page.drawText("FR.AK.01 - PERSETUJUAN ASESMEN DAN KERAHASIAAN", {
                x: 40, y, size: 11, font: fontBold
            });
            y -= 20;
            // Pernyataan header
            const headerStatement = "Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah diberi arahan secara rinci tentang perencanaan dan proses asesmen";
            y = (0, pdfDraw_helper_1.drawParagraph)(page, headerStatement, 40, y, font, 9, "left", (0, pdf_lib_1.rgb)(0, 0, 0), 520, 12);
            y -= 10;
            // === INFO SKEMA (dalam tabel) ===
            const infoData = [
                ["Judul", ":", (_d = (_c = (_b = (_a = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _a === void 0 ? void 0 : _a.occupation) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.toUpperCase()) !== null && _d !== void 0 ? _d : "-"],
                ["Nomor", ":", (_f = (_e = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _e === void 0 ? void 0 : _e.code) !== null && _f !== void 0 ? _f : "-"],
            ];
            // Header Skema Sertifikasi + Info
            const schemeHeaderWidth = 90;
            const labelWidth = 42;
            const colonWidth = 11;
            const valueWidth = 377;
            const tableWidth = schemeHeaderWidth + labelWidth + colonWidth + valueWidth;
            // Draw "Skema Sertifikasi Okupasi" header
            page.drawRectangle({
                x: 40,
                y: y - 40,
                width: schemeHeaderWidth,
                height: 40,
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1,
            });
            page.drawText("Skema Sertifikasi", { x: 45, y: y - 15, size: 9, font: fontBold });
            page.drawText("Okupasi", { x: 45, y: y - 27, size: 9, font: fontBold });
            // Draw info rows (Judul, Nomor)
            let infoY = y;
            for (let i = 0; i < infoData.length; i++) {
                const row = infoData[i];
                let x = 40 + schemeHeaderWidth;
                page.drawRectangle({ x, y: infoY - 20, width: labelWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[0], x, infoY, labelWidth, 20, fontBold, 9, "left");
                x += labelWidth;
                page.drawRectangle({ x, y: infoY - 20, width: colonWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[1], x, infoY, colonWidth, 20, font, 9, "center");
                x += colonWidth;
                page.drawRectangle({ x, y: infoY - 20, width: valueWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[2], x, infoY, valueWidth, 20, font, 9, "left");
                infoY -= 20;
            }
            y -= 40;
            // === TUK, Nama Asesor, Nama Asesi, Tanggal ===
            const detailData = [
                ["TUK", ":", (_g = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.tuk) !== null && _g !== void 0 ? _g : "-"],
                ["Nama Asesor", ":", (_j = (_h = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessor) === null || _h === void 0 ? void 0 : _h.name) !== null && _j !== void 0 ? _j : "-"],
                ["Nama Asesi", ":", (_l = (_k = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessee) === null || _k === void 0 ? void 0 : _k.name) !== null && _l !== void 0 ? _l : "-"],
                ["Tanggal", ":", (_m = (0, date_helper_1.formatDate)(resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.created_at)) !== null && _m !== void 0 ? _m : "-"],
            ];
            for (const row of detailData) {
                let x = 40;
                page.drawRectangle({ x, y: y - 20, width: schemeHeaderWidth + labelWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[0], x, y, schemeHeaderWidth + labelWidth, 20, font, 9, "left");
                x += schemeHeaderWidth + labelWidth;
                page.drawRectangle({ x, y: y - 20, width: colonWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[1], x, y, colonWidth, 20, font, 9, "center");
                x += colonWidth;
                page.drawRectangle({ x, y: y - 20, width: valueWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[2], x, y, valueWidth, 20, font, 9, "left");
                y -= 20;
            }
            // === BUKTI YANG DIKUMPULKAN (2 kolom checkbox) ===
            const allEvidenceTypes = [
                "Verifikasi Portofolio",
                "Observasi Langsung",
                "Pertanyaan Lisan",
                "Pertanyaan Wawancara",
                "Review Produk",
                "Kegiatan Terstruktur",
                "Pertanyaan Tertulis",
                "Lainnya"
            ];
            const selectedEvidences = resultDetails.ak01_header.rows.map((row) => row.evidence.toLowerCase());
            const evidenceBoxHeight = 90;
            // Label "Bukti yang dikumpulkan"
            page.drawRectangle({ x: 40, y: y - evidenceBoxHeight, width: schemeHeaderWidth + labelWidth, height: evidenceBoxHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
            (0, helper_1.drawCellText)(page, "Bukti yang dikumpulkan", 40, y - evidenceBoxHeight / 2 + 10, schemeHeaderWidth + labelWidth, 20, font, 9, "left");
            // Colon
            page.drawRectangle({ x: 40 + schemeHeaderWidth + labelWidth, y: y - evidenceBoxHeight, width: colonWidth, height: evidenceBoxHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
            (0, helper_1.drawCellText)(page, ":", 40 + schemeHeaderWidth + labelWidth, y - evidenceBoxHeight / 2 + 10, colonWidth, 20, font, 9, "center");
            // Evidence checkboxes area
            const evidenceAreaX = 40 + schemeHeaderWidth + labelWidth + colonWidth;
            page.drawRectangle({ x: evidenceAreaX, y: y - evidenceBoxHeight, width: valueWidth, height: evidenceBoxHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
            // Draw checkboxes in 2 columns (4 rows x 2 columns = 8 items)
            const checkboxSize = 10;
            const colWidth = valueWidth / 2;
            const rowSpacing = 20;
            let checkY = y - 12;
            for (let i = 0; i < allEvidenceTypes.length; i++) {
                const col = i % 2; // 0 = left column, 1 = right column
                const row = Math.floor(i / 2); // 0, 1, 2, 3
                const checkX = evidenceAreaX + 10 + (col * colWidth);
                const itemY = checkY - (row * rowSpacing);
                // Checkbox
                page.drawRectangle({
                    x: checkX,
                    y: itemY - checkboxSize,
                    width: checkboxSize,
                    height: checkboxSize,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                // Check if selected
                const isSelected = selectedEvidences.some((sel) => sel.includes(allEvidenceTypes[i].toLowerCase()) ||
                    allEvidenceTypes[i].toLowerCase().includes(sel));
                if (isSelected) {
                    page.drawText("V", { x: checkX + 2, y: itemY - checkboxSize + 2, size: 8, font: fontBold });
                }
                // Label
                page.drawText(allEvidenceTypes[i], { x: checkX + checkboxSize + 5, y: itemY - checkboxSize + 2, size: 9, font });
            }
            y -= evidenceBoxHeight;
            // === PELAKSANAAN ASESMEN ===
            const startDate = ((_o = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.schedule) === null || _o === void 0 ? void 0 : _o.start_date)
                ? `${(0, date_helper_1.formatDay)(resultDetails.schedule.start_date)}, ${(0, date_helper_1.formatDate)(resultDetails.schedule.start_date)}`
                : "-";
            const endDate = ((_p = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.schedule) === null || _p === void 0 ? void 0 : _p.end_date)
                ? `${(0, date_helper_1.formatDay)(resultDetails.schedule.end_date)}, ${(0, date_helper_1.formatDate)(resultDetails.schedule.end_date)}`
                : "-";
            const scheduleData = [
                ["Hari / Tanggal", ":", `${startDate} s.d. ${endDate}`],
                ["Waktu", ":", "Pukul 07.00 s.d. 17.00 WIB"],
                ["TUK", ":", (_q = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.tuk) !== null && _q !== void 0 ? _q : "-"],
            ];
            // Header "Pelaksanaan asesmen disepakati pada"
            const scheduleHeaderHeight = 60;
            page.drawRectangle({ x: 40, y: y - scheduleHeaderHeight, width: schemeHeaderWidth + labelWidth, height: scheduleHeaderHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
            page.drawText("Pelaksanaan asesmen", { x: 45, y: y - 20, size: 9, font });
            page.drawText("disepakati pada", { x: 45, y: y - 32, size: 9, font });
            // Schedule rows
            let schedY = y;
            for (let i = 0; i < scheduleData.length; i++) {
                const row = scheduleData[i];
                let x = 40 + schemeHeaderWidth + labelWidth;
                page.drawRectangle({ x, y: schedY - 20, width: 70, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[0], x, schedY, 70, 20, font, 9, "left");
                x += 70;
                page.drawRectangle({ x, y: schedY - 20, width: colonWidth, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[1], x, schedY, colonWidth, 20, font, 9, "center");
                x += colonWidth;
                page.drawRectangle({ x, y: schedY - 20, width: valueWidth - 70, height: 20, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                (0, helper_1.drawCellText)(page, row[2], x, schedY, valueWidth - 70, 20, font, 9, "left");
                schedY -= 20;
            }
            y -= scheduleHeaderHeight;
            y -= 10;
            // === SECTION TANDA TANGAN ===
            if (y < BASE_MARGIN * 2 + 100) {
                ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            }
            y = yield (0, helper_1.drawFeedbackAK01)(pdfDoc, page, resultDetails, 40, y, font, fontBold);
            return yield pdfDoc.save();
        });
    }
    static generateAK02(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold);
            const resultDetails = yield ak_02_service_1.AK02Service.getResultDetails(resultId);
            // === TITLE ===
            page.drawText("FR.AK.02 - REKAMAN ASESMEN KOMPETENSI", {
                x: 40, y, size: 11, font: fontBold
            });
            y -= 20;
            // === SKEMA / INFO ===
            const info = [
                ["Judul", ":", (_c = (_b = (_a = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _a === void 0 ? void 0 : _a.occupation) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : "-"],
                ["Nomor", ":", (_e = (_d = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessment) === null || _d === void 0 ? void 0 : _d.code) !== null && _e !== void 0 ? _e : "-"],
                ["TUK", ":", (_f = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.tuk) !== null && _f !== void 0 ? _f : "-"],
                ["Nama Asesor", ":", (_h = (_g = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessor) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : "-"],
                ["Nama Asesi", ":", (_k = (_j = resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.assessee) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : "-"],
                ["Mulai", ":", new Date(resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.created_at)
                        .toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC"
                    })
                ],
                ["Selesai", ":", new Date(resultDetails === null || resultDetails === void 0 ? void 0 : resultDetails.updated_at)
                        .toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC"
                    })],
            ];
            y = yield (0, helper_1.drawCertificateLayoutAK02)(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
            y -= 20;
            const evidenceTypes = [
                "Observasi Demonstrasi",
                "Portofolio",
                "Pernyataan Pihak Ketiga / Wawancara",
                "Pertanyaan Lisan",
                "Pertanyaan Tertulis",
                "Proyek Kerja",
                "Lainnya",
            ];
            const selectedEvidences = resultDetails.ak02_headers.rows.map((row) => evidenceTypes.map((evidenceType) => row.evidences.some((evidence) => evidence.evidence === evidenceType)));
            // === TABEL UNIT KOMPETENSI & BUKTI ===
            const tableHeader = [
                ["Unit Kompetensi", ...evidenceTypes],
            ];
            const tableRows = resultDetails.ak02_headers.rows.map((row, i) => [
                `${row.unit_title}`,
                ...selectedEvidences[i].map((selected) => selected ? "V" : ""),
            ]);
            const tableData = [...tableHeader, ...tableRows];
            const colsWidth = [
                140, 62, 52, 70, 56, 56, 40, 44
            ];
            ({ page, y } = yield (0, helper_1.drawTable)(page, pdfDoc, tableData, colsWidth, 40, y, 25, font, fontBold));
            y -= 30;
            if (y < BASE_MARGIN * 2) {
                ({ page, y } = yield (0, helper_1.createNewPage)(pdfDoc, headerImage, fontBold));
            }
            y = yield (0, helper_1.drawFeedbackAK02)(pdfDoc, page, resultDetails, 40, y, font, fontBold);
            return yield pdfDoc.save();
        });
    }
}
exports.ResultPdfService = ResultPdfService;
