import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { kopSurat } from "../../../helper/pdfAssets.helper";
import { elementIAResponse, GroupIA01Response } from "../ia-01/ia-01.type";
import { IA01Service } from "../ia-01/ia-01.service";
import { createNewPage, drawCellText, drawCertificateLayout, drawCertificateLayoutAK02, drawChecklistTable, drawElementApl02Layout, drawElementIa01Layout, drawFeedbackAK02, drawFeedbackAPL02, drawFeedbackIA01, drawFeedbackIA03, drawSignatureAPL01, drawFeedbackAK01, drawTable, drawUnitGroupLayout, drawUnitLayout, measureElementLayoutHeight, measureUnitLayoutHeight, drawIA05QuestionTable, drawFeedbackIA05, drawFeedbackAK05 } from "./helper";
import { IA03Service } from "../ia-03/ia-03.service";
import { formatDate, formatDay } from "../../../helper/date.helper";
import { drawField, drawParagraph } from "../../../helper/pdfDraw.helper";
import { APL1Service } from "../apl-01/apl-01.service";
import { AssesseeService } from "../../assessee/asseessee.service";
import { AK02Service } from "../ak-02/ak-02.service";
import { AK01Service } from "../ak-01/ak-01.service";
import { he } from "@faker-js/faker/.";
import { APL02Service } from "../apl-02/apl-02.service";
import { IA05Service } from "../ia-05/ia-05.service";
import { AK05Service } from "../ak-05/ak-05.service";

const BASE_MARGIN = 150;
const ELEMENT_ROW_HEIGHT = 20;

interface ChecklistData {
    schemaTitle: string;
    schemaNumber: string;
    tuk: string;
    assessor: string;
    assessee: string;
    date: string;
    pekerjaan: {
        title: string;
        unit: {
            kodeUnit: string;
            judulUnit: string;
            elemen: {
                no: number;
                elemen: string;
                kriteria: string[];
                standar: string;
                ya: boolean;
                tidak: boolean;
            }[];
        }[];
    }[];
}

const headerImage = "../../public/images/kop-surat-lsp-smkn24j.png";

export class ResultPdfService {
    static async generateApl02(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await APL02Service.getResultDetails(resultId);

        // ==== TITLE ====
        page.drawText(
            "FR.APL.02 - ASESMEN MANDIRI",
            { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 }
        );
        y -= 30;

        // ==== INFO SKEMA ====
        const info = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
            ["TUK", ":", resultDetails?.tuk ?? "-"],
            ["Nama Assesor", ":", resultDetails?.assessor?.name ?? "-"],
            ["Nama Asesee", ":", resultDetails?.assessee?.name ?? "-"],
            ["Tanggal", ":", resultDetails?.created_at ? `${formatDay(resultDetails.created_at)}, ${formatDate(resultDetails.created_at)}` : "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
        y -= 30;

        // ==== LOOP UNIT KOMPETENSI ====
        const units = await APL02Service.getUnitsAPL02(resultId);
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            const elements = await APL02Service.getElementsByUnitId(resultId, unit.id);

            if (y < BASE_MARGIN) {
                ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
            }

            y = await drawUnitLayout(
                page,
                i + 1,
                unit.unit_code,
                unit.title,
                40,
                y,
                20,
                font,
                fontBold,
            );

            ({ page, y } = await drawElementApl02Layout(pdfDoc, page, i + 1, elements, 40, y, font, fontBold, headerImage, BASE_MARGIN));

            y -= 20;
        }

        y -= 20;

        if (y < BASE_MARGIN + 260) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }
        y = await drawFeedbackAPL02(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.assessee?.name ?? "unknown",
        };
    }

    static async generateIA01(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await IA01Service.getResultDetails(resultId);

        const groups: GroupIA01Response[] = await IA01Service.getIA01Groups(resultId);

        // ==== TITLE ====
        page.drawText(
            "FR.IA.01.CL - CEKLIS OBSERVASI AKTIVITAS DI TEMPAT KERJA ATAU TEMPAT KERJA SIMULASI",
            { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 }
        );
        y -= 30;

        // ==== INFO SKEMA ====
        const info = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
            ["TUK", ":", resultDetails?.tuk ?? "-"],
            ["Nama Assesor", ":", resultDetails?.assessor?.name ?? "-"],
            ["Nama Asesi", ":", resultDetails?.assessee?.name ?? "-"],
            ["Tanggal", ":", resultDetails?.created_at ? `${formatDay(resultDetails.created_at)}, ${formatDate(resultDetails.created_at)}` : "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);

        // ==== LOOP GROUPS ====
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];

            if (y < BASE_MARGIN) {
                ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
            }

            y = await drawUnitGroupLayout(page, pdfDoc, i, group, 40, y, 20, font, fontBold);

            let unitIdx = 0;

            for (const unit of group.units) {
                const elements = await IA01Service.getElementsByUnitId(resultId, unit.id);

                // Page break
                if (y < BASE_MARGIN) {
                    ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
                }

                // Draw unit
                y -= 20;
                y = await drawUnitLayout(
                    page,
                    ++unitIdx,
                    unit.unit_code,
                    unit.title,
                    40,
                    y,
                    20,
                    font,
                    fontBold
                );

                // Draw elements
                y -= 20;
                ({ page, y } = await drawElementIa01Layout(pdfDoc, page, elements, 40, y, font, fontBold, headerImage, BASE_MARGIN));
            }
        }


        if (y < BASE_MARGIN + 470) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }
        y = await drawFeedbackIA01(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.assessee?.name ?? "unknown",
        };
    }

    static async generateAPL01(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontIcon = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);

        const FONTS = { s: 9, m: 10, l: 12 };
        // const GAPS = { s: 5, m: 10, l: 15 };

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        // Fetch data
        const resultDetails = await APL1Service.getResultDetails(resultId);
        const assessee = await AssesseeService.getAssesseeById(resultDetails?.id);

        let gender = resultDetails?.gender.toLowerCase();
        if (gender === "female") {
            gender = 'Perempuan';
        } else if (gender === "male") {
            gender = 'Laki-laki';
        } else {
            throw new Error(`Gender ${gender} tidak diketahui`);
        }

        // ==== TITLE ====
        page.drawText(
            "FR.APL.01. PERMOHONAN SERTIFIKASI KOMPETENSI",
            { x: 40, y, size: FONTS.l, font: fontBold, maxWidth: 520, lineHeight: 16 }
        );
        y -= 30;

        // ==== SECTION 1 ====
        page.drawText(
            "Bagian 1 : Rincian Data Pemohon Sertifikasi",
            { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 20;

        page.drawText(
            "a. Data Pribadi",
            { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 15;

        y = drawField(page, "Nama Lengkap", `${resultDetails?.full_name}`, 40, y, font, FONTS.m);
        y = drawField(page, "NIK", `${resultDetails?.identity_number}`, 40, y, font, FONTS.m);
        y = drawField(page, "Tempat / Tanggal Lahir ", `${resultDetails?.birth_location} / ${resultDetails?.birth_date}`, 40, y, font, FONTS.m);
        y = drawField(page, "Jenis Kelamin", `${gender}`, 40, y, font, FONTS.m);
        y = drawField(page, "Kewarganegaraan", `${resultDetails?.nationality}`, 40, y, font, FONTS.m);
        y = drawField(page, "Alamat Rumah", `${resultDetails?.address}`, 40, y, font, FONTS.m);
        y = drawField(page, "No Hp", `${resultDetails?.phone_no}`, 40, y, font, FONTS.m);
        y = drawField(page, "Email", `${assessee?.email.toLowerCase()}`, 40, y, font, FONTS.m);
        y = drawField(page, "Kualifikasi Pendidikan ", `${resultDetails?.educational_qualifications}`, 40, y, font, FONTS.m);

        y -= 20;
        page.drawText(
            "b. Data Sekolah",
            { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 15;
        y = drawField(page, "Nama Sekolah", `${resultDetails?.job.institution_name}`, 40, y, font, FONTS.m);
        // y = drawField(page, "Konsentrasi Keahlian", `${resultDetails?.job.work_unit}`, 40, y, font, FONTS.m);
        y = drawField(page, "Alamat Sekolah", `${resultDetails?.job.address}`, 40, y, font, FONTS.m);
        y = drawField(page, "No Telpon Sekolah", `${resultDetails?.job.phone_no}`, 40, y, font, FONTS.m);
        y = drawField(page, "Email Sekolah", `${resultDetails?.job.job_email}`, 40, y, font, FONTS.m);

        // === PAGE BREAK ===
        ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));

        // ==== SECTION 2 ====
        page.drawText(
            "Bagian 2 : Data Sertifikasi",
            { x: 40, y, size: FONTS.m, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 20;

        // ==== INFO SKEMA ====
        const info = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
            ["Tujuan Asesmen", ":", `Sertifikasi`],
            ["Tujuan Asesmen", ":", `Pengakuan Kompetensi Terkini (PKT)`],
            ["Tujuan Asesmen", ":", `Rekognisi Pembelajaran Lampau (RPL)`],
            ["Tujuan Asesmen", ":", `Lainnya`],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, font);
        y -= 30;

        page.drawText(
            "Daftar Unit Kompetensi sesuai kemasan:",
            { x: 40, y, size: FONTS.m, font: font, maxWidth: 520, lineHeight: 14 }
        );
        y -= 10;

        drawSchemeTableHeader(page, y, resultDetails?.assessment, fontBold, FONTS.s, rgb(0, 0, 0));
        y -= 60;

        ({ page, y } = await drawUnitTable(page, pdfDoc, y, resultDetails?.assessment?.uc_apl02s || [], font, fontBold, FONTS.s, rgb(0, 0, 0)));

        // === PAGE BREAK ===
        ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));

        // ==== SECTION 3 ====
        page.drawText(
            "Bagian 2 : Data Sertifikasi",
            { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 20;

        page.drawText("3.1. Bukti Persyaratan Dasar Pemohon", { x: 40, y, size: FONTS.s, font: fontBold });
        y -= 10;
        y = await drawChecklistTable(
            page,
            [
                { label: "Rapor Semester 1 s.d. 5", ...docStatus(resultDetails.resultDoc?.school_report_card) },
                { label: "Sertifikat Praktek Kerja Lapangan (PKL)", ...docStatus(resultDetails.resultDoc?.field_work_practice_certificate) },
            ],
            40, y, 20, font, fontIcon
        );

        y -= 25;

        page.drawText("3.2. Bukti Administratif", { x: 40, y, size: FONTS.s, font: fontBold });
        y -= 10;
        y = await drawChecklistTable(
            page,
            [
                { label: "Kartu Pelajar", ...docStatus(resultDetails.resultDoc?.student_card) },
                { label: "Kartu Keluarga", ...docStatus(resultDetails.resultDoc?.family_card) },
                { label: "Foto", ...docStatus(resultDetails.resultDoc?.id_card) },
            ],
            40, y, 20, font, fontIcon
        );

        y -= 20;

        await drawSignatureAPL01(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.full_name ?? "unknown",
        };

        function drawSchemeTableHeader(page: PDFPage, y: number, data: any, fontBold: PDFFont, fontSize: number, color: RGB) {
            const w = page.getWidth() - 80;
            const x = 40;

            page.drawRectangle({ x, y: y - 60, width: 90, height: 60, borderColor: color, borderWidth: 1 });
            let yText = y - 15;
            yText = drawParagraph(page, "SKEMA", 50, yText - 4, fontBold, fontSize, "left", undefined, 80);
            yText = drawParagraph(page, "SERTIFIKASI", 50, yText, fontBold, fontSize, "left", undefined, 80);
            yText = drawParagraph(page, "OKUPASI", 50, yText, fontBold, fontSize, "left", undefined, 80);

            ["JUDUL", "NOMOR"].forEach((text, i) => {
                const yOffset = y - 30 * (i + 1);
                page.drawRectangle({ x: 130, y: yOffset, width: 80, height: 30, borderColor: color, borderWidth: 1 });
                drawParagraph(page, text, 142, yOffset + 10, fontBold, fontSize);
                drawParagraph(page, ":", 198, yOffset + 10, fontBold, fontSize);
            });

            ["name", "code"].forEach((field, i) => {
                page.drawRectangle({
                    x: 190,
                    y: y - 30 * (i + 1),
                    width: w - BASE_MARGIN,
                    height: 30,
                    borderColor: color,
                    borderWidth: 1,
                });
                const value = field === "name" ? data?.occupation?.name?.toUpperCase() : data?.code || "-";
                drawParagraph(page, value, 215, y - 20 - 30 * i, fontBold, fontSize);
            });
        }

        function drawUnitTable(page: PDFPage, pdfDoc: PDFDocument, y: number, data: any[], font: PDFFont, fontBold: PDFFont, fontSize: number, color: RGB) {
            const x = 40;
            const width = page.getWidth() - 80;
            const rowHeight = 20;
            const col = { no: 30, code: 120, title: width - BASE_MARGIN };
            const colArray = [col.no, col.code, col.title];
            const tableData = [
                ["NO", "KODE UNIT", "JUDUL UNIT"],
                ...data.map((result: any, i: number) => [
                    `${i + 1}`,
                    `${result?.unit_code || "-"}`,
                    `${result?.title || "-"}`,
                ])
            ];

            return drawTable(page, pdfDoc, tableData, colArray, x, y - rowHeight, rowHeight, font, fontBold, BASE_MARGIN, fontSize, "left");
        }

        function docStatus(file?: string | null) {
            if (file) {
                return { memenuhi: true, tidakMemenuhi: false, tidakAda: false };
            }
            return { memenuhi: false, tidakMemenuhi: false, tidakAda: true };
        }
    }

    static async generateAK01(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await AK01Service.getDataForAK01(resultId);

        // === TITLE ===
        page.drawText("FR.AK.01 - PERSETUJUAN ASESMEN DAN KERAHASIAAN", {
            x: 40, y, size: 11, font: fontBold
        });
        y -= 20;

        // Pernyataan header
        const headerStatement = "Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah diberi arahan secara rinci tentang perencanaan dan proses asesmen";
        y = drawParagraph(page, headerStatement, 40, y, font, 9, "left", rgb(0, 0, 0), 520, 12);
        y -= 10;

        // === INFO SKEMA (dalam tabel) ===
        const infoData = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name?.toUpperCase() ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
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
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });
        page.drawText("Skema Sertifikasi", { x: 45, y: y - 15, size: 9, font: fontBold });
        page.drawText("Okupasi", { x: 45, y: y - 27, size: 9, font: fontBold });

        // Draw info rows (Judul, Nomor)
        let infoY = y;
        for (let i = 0; i < infoData.length; i++) {
            const row = infoData[i];
            let x = 40 + schemeHeaderWidth;

            page.drawRectangle({ x, y: infoY - 20, width: labelWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[0], x, infoY, labelWidth, 20, fontBold, 9, "left");
            x += labelWidth;

            page.drawRectangle({ x, y: infoY - 20, width: colonWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[1], x, infoY, colonWidth, 20, font, 9, "center");
            x += colonWidth;

            page.drawRectangle({ x, y: infoY - 20, width: valueWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[2], x, infoY, valueWidth, 20, font, 9, "left");

            infoY -= 20;
        }
        y -= 40;

        // === TUK, Nama Asesor, Nama Asesi, Tanggal ===
        const detailData = [
            ["TUK", ":", resultDetails?.tuk ?? "-"],
            ["Nama Asesor", ":", resultDetails?.assessor?.name ?? "-"],
            ["Nama Asesi", ":", resultDetails?.assessee?.name ?? "-"],
            ["Tanggal", ":", resultDetails?.created_at ? `${formatDay(resultDetails.created_at)}, ${formatDate(resultDetails.created_at)}` : "-"],
        ];

        for (const row of detailData) {
            let x = 40;
            page.drawRectangle({ x, y: y - 20, width: schemeHeaderWidth + labelWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[0], x, y, schemeHeaderWidth + labelWidth, 20, font, 9, "left");
            x += schemeHeaderWidth + labelWidth;

            page.drawRectangle({ x, y: y - 20, width: colonWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[1], x, y, colonWidth, 20, font, 9, "center");
            x += colonWidth;

            page.drawRectangle({ x, y: y - 20, width: valueWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[2], x, y, valueWidth, 20, font, 9, "left");

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
        const selectedEvidences = resultDetails.ak01_header.rows.map((row: any) => row.evidence.toLowerCase());

        const evidenceBoxHeight = 90;

        // Label "Bukti yang dikumpulkan"
        page.drawRectangle({ x: 40, y: y - evidenceBoxHeight, width: schemeHeaderWidth + labelWidth, height: evidenceBoxHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
        drawCellText(page, "Bukti yang dikumpulkan", 40, y - evidenceBoxHeight / 2 + 10, schemeHeaderWidth + labelWidth, 20, font, 9, "left");

        // Colon
        page.drawRectangle({ x: 40 + schemeHeaderWidth + labelWidth, y: y - evidenceBoxHeight, width: colonWidth, height: evidenceBoxHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
        drawCellText(page, ":", 40 + schemeHeaderWidth + labelWidth, y - evidenceBoxHeight / 2 + 10, colonWidth, 20, font, 9, "center");

        // Evidence checkboxes area
        const evidenceAreaX = 40 + schemeHeaderWidth + labelWidth + colonWidth;
        page.drawRectangle({ x: evidenceAreaX, y: y - evidenceBoxHeight, width: valueWidth, height: evidenceBoxHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });

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
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });

            // Check if selected
            const isSelected = selectedEvidences.some((sel: string) =>
                sel.includes(allEvidenceTypes[i].toLowerCase()) ||
                allEvidenceTypes[i].toLowerCase().includes(sel)
            );
            if (isSelected) {
                page.drawText("V", { x: checkX + 2, y: itemY - checkboxSize + 2, size: 8, font: fontBold });
            }

            // Label
            page.drawText(allEvidenceTypes[i], { x: checkX + checkboxSize + 5, y: itemY - checkboxSize + 2, size: 9, font });
        }

        y -= evidenceBoxHeight;

        // === PELAKSANAAN ASESMEN ===
        const startDate = resultDetails?.schedule?.start_date
            ? `${formatDay(resultDetails.schedule.start_date)}, ${formatDate(resultDetails.schedule.start_date)}`
            : "-";
        const endDate = resultDetails?.schedule?.end_date
            ? `${formatDay(resultDetails.schedule.end_date)}, ${formatDate(resultDetails.schedule.end_date)}`
            : "-";

        const scheduleData = [
            ["Hari / Tanggal", ":", `${startDate} s.d. ${endDate}`],
            ["Waktu", ":", "Pukul 07.00 s.d. 17.00 WIB"],
            ["TUK", ":", resultDetails?.tuk ?? "-"],
        ];

        // Header "Pelaksanaan asesmen disepakati pada"
        const scheduleHeaderHeight = 60;
        page.drawRectangle({ x: 40, y: y - scheduleHeaderHeight, width: schemeHeaderWidth + labelWidth, height: scheduleHeaderHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
        page.drawText("Pelaksanaan asesmen", { x: 45, y: y - 20, size: 9, font });
        page.drawText("disepakati pada", { x: 45, y: y - 32, size: 9, font });

        // Schedule rows
        let schedY = y;
        for (let i = 0; i < scheduleData.length; i++) {
            const row = scheduleData[i];
            let x = 40 + schemeHeaderWidth + labelWidth;

            page.drawRectangle({ x, y: schedY - 20, width: 70, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[0], x, schedY, 70, 20, font, 9, "left");
            x += 70;

            page.drawRectangle({ x, y: schedY - 20, width: colonWidth, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[1], x, schedY, colonWidth, 20, font, 9, "center");
            x += colonWidth;

            page.drawRectangle({ x, y: schedY - 20, width: valueWidth - 70, height: 20, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            drawCellText(page, row[2], x, schedY, valueWidth - 70, 20, font, 9, "left");

            schedY -= 20;
        }
        y -= scheduleHeaderHeight;
        y -= 10;

        // === SECTION TANDA TANGAN ===
        if (y < BASE_MARGIN * 2 + 100) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }
        y = await drawFeedbackAK01(pdfDoc, page, resultDetails, 40, y, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.assessee?.name ?? "unknown",
        };
    }

    static async generateAK02(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await AK02Service.getResultDetails(resultId);

        // === TITLE ===
        page.drawText("FR.AK.02 - REKAMAN ASESMEN KOMPETENSI", {
            x: 40, y, size: 11, font: fontBold
        });
        y -= 20;

        // === SKEMA / INFO ===
        const info = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
            ["TUK", ":", resultDetails?.tuk ?? "-"],
            ["Nama Asesor", ":", resultDetails?.assessor?.name ?? "-"],
            ["Nama Asesi", ":", resultDetails?.assessee?.name ?? "-"],
            ["Mulai", ":", new Date(resultDetails?.created_at)
                .toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC"
                })
            ],
            ["Selesai", ":", new Date(resultDetails?.updated_at)
                .toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC"
                })],
        ];
        y = await drawCertificateLayoutAK02(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
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

        const selectedEvidences = resultDetails.ak02_headers.rows.map((row) =>
            evidenceTypes.map((evidenceType) => row.evidences.some((evidence) => evidence.evidence === evidenceType))
        );

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
        ({ page, y } = await drawTable(page, pdfDoc, tableData, colsWidth, 40, y, 25, font, fontBold));
        y -= 30;

        if (y < BASE_MARGIN * 2) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }

        y = await drawFeedbackAK02(pdfDoc, page, resultDetails, 40, y, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.assessee?.name ?? "unknown",
        };
    }

    static async generateIA03(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await IA03Service.getResultDetails(resultId);
        const groups = await IA03Service.getIA03Groups(resultId);

        // ==== TITLE ====
        page.drawText(
            "FR.IA.03 - PERTANYAAN UNTUK MENDUKUNG OBSERVASI",
            { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 }
        );
        y -= 30;

        // ==== INFO SKEMA ====
        const info = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
            ["TUK", ":", resultDetails?.tuk ?? "-"],
            ["Nama Asesor", ":", resultDetails?.assessor?.name ?? "-"],
            ["Nama Asesi", ":", resultDetails?.assessee?.name ?? "-"],
            ["Tanggal", ":", resultDetails?.created_at ? `${formatDay(resultDetails.created_at)}, ${formatDate(resultDetails.created_at)}` : "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
        y -= 20;

        // ==== LOOP GROUPS ====
        for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
            const group = groups[groupIdx];

            // === GROUP HEADER WITH MERGED CELL ===

            // Calculate table height based on number of units
            const unitRowHeight = 25;
            const unitTableHeight = (group.units.length + 1) * unitRowHeight; // +1 for header

            // Check if we need a page break before drawing the unit table
            if (y - unitTableHeight - 20 < BASE_MARGIN) {
                ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
            }

            y -= 20;

            y = await drawUnitGroupLayout(page, pdfDoc, groupIdx, group, 40, y, 20, font, fontBold);

            y -= 20;

            // === QUESTIONS TABLE ===
            if (group.questions && group.questions.length > 0) {
                const noColWidth = 50;
                const questionColWidth = 370;
                const yaColWidth = 50;
                const tdkColWidth = 50;
                const totalWidth = noColWidth + questionColWidth + yaColWidth + tdkColWidth;
                const qRowHeight = 30;
                const tanggapanRowHeight = 70;
                const headerHeight = qRowHeight * 2;

                // Check if we need a page break for the question table header
                if (y - headerHeight < BASE_MARGIN) {
                    ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
                }

                let qX = 40;
                let qY = y;

                // Header row 1 - "Pertanyaan" merged (spans No + Question columns, 2 rows height)
                page.drawRectangle({
                    x: qX,
                    y: qY - qRowHeight * 2,
                    width: noColWidth + questionColWidth,
                    height: qRowHeight * 2,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, "Pertanyaan", qX, qY - qRowHeight / 2, noColWidth + questionColWidth, qRowHeight, fontBold, 10, "center");

                // "Pencapaian" header spanning Ya and Tdk
                page.drawRectangle({
                    x: qX + noColWidth + questionColWidth,
                    y: qY - qRowHeight,
                    width: yaColWidth + tdkColWidth,
                    height: qRowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, "Pencapaian", qX + noColWidth + questionColWidth, qY, yaColWidth + tdkColWidth, qRowHeight, fontBold, 9, "center");

                // Ya and Tdk sub-headers
                page.drawRectangle({
                    x: qX + noColWidth + questionColWidth,
                    y: qY - qRowHeight * 2,
                    width: yaColWidth,
                    height: qRowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, "Ya", qX + noColWidth + questionColWidth, qY - qRowHeight, yaColWidth, qRowHeight, fontBold, 9, "center");

                page.drawRectangle({
                    x: qX + noColWidth + questionColWidth + yaColWidth,
                    y: qY - qRowHeight * 2,
                    width: tdkColWidth,
                    height: qRowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, "Tdk", qX + noColWidth + questionColWidth + yaColWidth, qY - qRowHeight, tdkColWidth, qRowHeight, fontBold, 9, "center");

                qY -= qRowHeight * 2;

                // Question rows
                for (let qIdx = 0; qIdx < group.questions.length; qIdx++) {
                    const q = group.questions[qIdx];
                    const answer = q.result?.answer ?? "";
                    const isApproved = q.result?.approved ?? false;
                    const hasResult = q.result !== null;

                    // Calculate total height needed for this question (question row + tanggapan row)
                    const questionTotalHeight = qRowHeight + tanggapanRowHeight;

                    // Check if need page break (need space for question row + tanggapan row)
                    if (qY - questionTotalHeight < BASE_MARGIN) {
                        ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
                        qY = y;
                    }

                    // === Question Row ===
                    // No. cell
                    page.drawRectangle({
                        x: qX,
                        y: qY - qRowHeight,
                        width: noColWidth,
                        height: qRowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    drawCellText(page, `${qIdx + 1}.`, qX, qY, noColWidth, qRowHeight, font, 9, "center");

                    // Question text cell (spans question + Ya + Tdk columns)
                    page.drawRectangle({
                        x: qX + noColWidth,
                        y: qY - qRowHeight,
                        width: questionColWidth + yaColWidth + tdkColWidth,
                        height: qRowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    drawCellText(page, q.question, qX + noColWidth, qY, questionColWidth + yaColWidth + tdkColWidth, qRowHeight, font, 9, "left");

                    qY -= qRowHeight;

                    // === Tanggapan Row ===
                    // "Tanggapan:" label + answer area (spans No + Question columns)
                    page.drawRectangle({
                        x: qX,
                        y: qY - tanggapanRowHeight,
                        width: noColWidth + questionColWidth,
                        height: tanggapanRowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    page.drawText("Tanggapan:", { x: qX + 5, y: qY - 15, size: 9, font: fontBold });
                    // Draw answer text if available
                    if (answer) {
                        drawCellText(page, answer, qX, qY - 20, noColWidth + questionColWidth, tanggapanRowHeight - 20, font, 9, "left");
                    }

                    // Ya checkbox cell
                    page.drawRectangle({
                        x: qX + noColWidth + questionColWidth,
                        y: qY - tanggapanRowHeight,
                        width: yaColWidth,
                        height: tanggapanRowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    // Draw checkbox
                    const checkboxSize = 12;
                    const checkboxX = qX + noColWidth + questionColWidth + (yaColWidth - checkboxSize) / 2;
                    const checkboxY = qY - (tanggapanRowHeight / 2) - (checkboxSize / 2);
                    page.drawRectangle({
                        x: checkboxX,
                        y: checkboxY,
                        width: checkboxSize,
                        height: checkboxSize,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    if (isApproved) {
                        page.drawText("V", { x: checkboxX + 2, y: checkboxY + 2, size: 10, font: fontBold });
                    }

                    // Tdk checkbox cell
                    page.drawRectangle({
                        x: qX + noColWidth + questionColWidth + yaColWidth,
                        y: qY - tanggapanRowHeight,
                        width: tdkColWidth,
                        height: tanggapanRowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    // Draw checkbox
                    const checkboxX2 = qX + noColWidth + questionColWidth + yaColWidth + (tdkColWidth - checkboxSize) / 2;
                    page.drawRectangle({
                        x: checkboxX2,
                        y: checkboxY,
                        width: checkboxSize,
                        height: checkboxSize,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    if (!isApproved && hasResult) {
                        page.drawText("V", { x: checkboxX2 + 2, y: checkboxY + 2, size: 10, font: fontBold });
                    }

                    qY -= tanggapanRowHeight;
                }

                y = qY;
            }

            y -= 20;
        }

        // === SIGNATURE SECTION ===
        if (y < BASE_MARGIN + 470) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }
        y = await drawFeedbackIA03(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.assessee?.name ?? "unknown",
        };
    }

    static async generateIA05(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await IA05Service.getResultDetails(resultId);

        const ia05Answers = await IA05Service.getAssesseeAnswers(resultId);

        // ==== TITLE ====
        page.drawText(
            "FR.IA.05.C. LEMBAR JAWABAN PILIHAN GANDA",
            { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 }
        );
        y -= 30;

        // ==== INFO SKEMA ====
        const info = [
            ["Judul", ":", resultDetails?.assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", resultDetails?.assessment?.code ?? "-"],
            ["TUK", ":", resultDetails?.tuk ?? "-"],
            ["Nama Assesor", ":", resultDetails?.assessor?.name ?? "-"],
            ["Nama Asesi", ":", resultDetails?.assessee?.name ?? "-"],
            ["Tanggal", ":", resultDetails?.created_at ? `${formatDay(resultDetails.created_at)}, ${formatDate(resultDetails.created_at)}` : "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);

        y -= 30;

        // ==== DRAW QUESTION TABLE ====
        ({ page, y } = await drawIA05QuestionTable(pdfDoc, page, ia05Answers, 40, y, font, fontBold, headerImage, BASE_MARGIN));

        y -= 30;

        // ==== DRAW FEEDBACK SECTION ====
        if (y < BASE_MARGIN + 200) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }
        y = await drawFeedbackIA05(pdfDoc, page, resultDetails, 40, y, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.assessee?.name ?? "unknown",
        };
    }

    static async generateAK05(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await AK05Service.getAK05ByResultId(resultId);
        if (!resultDetails) {
            throw new Error('AK05 data not found');
        }

        // ==== TITLE ====
        page.drawText(
            "FR.AK.05. LAPORAN ASESMEN",
            { x: 40, y, size: 12, font: fontBold, maxWidth: 520, lineHeight: 16 }
        );
        y -= 30;

        // ==== INFO SKEMA ====
        const assessment = resultDetails.result.assessment as any;
        const info = [
            ["Judul", ":", assessment?.occupation?.name ?? "-"],
            ["Nomor", ":", assessment?.code ?? "-"],
            ["TUK", ":", resultDetails.result.tuk ?? "-"],
            ["Nama Asesor", ":", resultDetails.result.assessor?.name ?? "-"],
            ["Tanggal", ":", resultDetails.result.created_at ? `${formatDay(new Date(resultDetails.result.created_at))}, ${formatDate(new Date(resultDetails.result.created_at))}` : "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
        y -= 30;

        // ==== TABEL REKOMENDASI ====
        const tableHeaders = [
            ["No.", "Nama Asesi", "Rekomendasi", "Keterangan"],
            ["1.", resultDetails.result.assessee?.name ?? "-", resultDetails.is_competent ? "K" : "BK", resultDetails.is_competent ? "Kompeten" : "Belum Kompeten"],
        ];

        let tableY = y;
        const colWidths = [40, 200, 100, 180];
        const rowHeight = 20;

        // Draw header row
        let x = 40;
        tableHeaders[0].forEach((cell, idx) => {
            page.drawRectangle({
                x,
                y: tableY - rowHeight,
                width: colWidths[idx],
                height: rowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            drawCellText(page, cell, x, tableY, colWidths[idx], rowHeight, fontBold, 9, "center");
            x += colWidths[idx];
        });
        tableY -= rowHeight;

        // Draw data row
        x = 40;
        tableHeaders[1].forEach((cell, idx) => {
            page.drawRectangle({
                x,
                y: tableY - rowHeight,
                width: colWidths[idx],
                height: rowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            drawCellText(page, cell, x, tableY, colWidths[idx], rowHeight, font, 9, "left");
            x += colWidths[idx];
        });
        tableY -= rowHeight;

        y = tableY - 20;

        // ==== FEEDBACK SECTION ====
        if (y < BASE_MARGIN + 300) {
            ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        }
        y = await drawFeedbackAK05(pdfDoc, page, resultDetails.result, 40, y, 20, font, fontBold);

        return {
            pdfBytes: await pdfDoc.save(),
            assesseeName: resultDetails.result.assessee?.name ?? "unknown",
        };
    }
}
