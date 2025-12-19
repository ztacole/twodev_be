import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { kopSurat } from "../../../helper/pdfAssets.helper";
import { elementIAResponse, GroupIA01Response } from "../ia-01/ia-01.type";
import { IA01Service } from "../ia-01/ia-01.service";
import { createNewPage, drawCertificateLayout, drawCertificateLayoutAK02, drawChecklistTable, drawElementLayout, drawFeedbackAK02, drawFeedbackIA01, drawTable, drawUnitGroupLayout, drawUnitLayout, measureElementLayoutHeight, measureUnitLayoutHeight } from "./helper";
import { formatDate, formatDay } from "../../../helper/date.helper";
import { drawField, drawParagraph } from "../../../helper/pdfDraw.helper";
import { APL1Service } from "../apl-01/apl-01.service";
import { AssesseeService } from "../../assessee/asseessee.service";
import { AK02Service } from "../ak-02/ak-02.service";
import { he } from "@faker-js/faker/.";

const BOTTOM_MARGIN = 150;
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
            ["Tanggal", ":", resultDetails?.assessment?.created_at ? `${formatDay(resultDetails.assessment.created_at)}, ${formatDate(resultDetails.assessment.created_at)}` : "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);

        // ==== LOOP GROUPS ====
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];

            if (y < BOTTOM_MARGIN) {
                ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
            }

            y = await drawUnitGroupLayout(page, i, group, 40, y, 20, font, fontBold);

            let unitIdx = 0;

            for (const unit of group.units) {
                const elements = await IA01Service.getElementsByUnitId(resultId, unit.id);

                // Page break
                if (y < BOTTOM_MARGIN) {
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
                ({ page, y } = await drawElementLayout(pdfDoc, page, elements, 40, y, font, fontBold, headerImage, BOTTOM_MARGIN));
            }
        }


        ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        y = await drawFeedbackIA01(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);

        return await pdfDoc.save();
    }

    static async generateAPL01(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontIcon = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);

        const FONTS = { s: 9, m: 10, l: 12 };
        const GAPS = { s: 5, m: 10, l: 15 };

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        // Fetch data
        const resultDetails = await APL1Service.getResultDetails(resultId);
        const assessee = await AssesseeService.getAssesseeById(resultDetails?.id || 0);

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
            { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 20;

        page.drawText(
            "a. Data Pribadi",
            { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 15;

        y = drawField(page, "Nama Lengkap", `${resultDetails?.full_name}`, 40, y, font, FONTS.s);
        y = drawField(page, "NIK", `${resultDetails?.identity_number}`, 40, y, font, FONTS.s);
        y = drawField(page, "Tempat / Tanggal Lahir ", `${resultDetails?.birth_location} / ${resultDetails?.birth_date}`, 40, y, font, FONTS.s);
        y = drawField(page, "Jenis Kelamin", `${gender}`, 40, y, font, FONTS.s);
        y = drawField(page, "Kewarganegaraan", `${resultDetails?.nationality}`, 40, y, font, FONTS.s);
        y = drawField(page, "Alamat Rumah", `${resultDetails?.address}`, 40, y, font, FONTS.s);
        y = drawField(page, "No Hp", `${resultDetails?.phone_no}`, 40, y, font, FONTS.s);
        y = drawField(page, "Email", `${assessee?.email.toLowerCase()}`, 40, y, font, FONTS.s);
        y = drawField(page, "Kualifikasi Pendidikan ", `${resultDetails?.educational_qualifications}`, 40, y, font, FONTS.s);

        y -= 20;
        page.drawText(
            "b. Data Sekolah",
            { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 }
        );
        y -= 15;
        y = drawField(page, "Nama Sekolah", `${resultDetails?.job.institution_name}`, 40, y, font, FONTS.s);
        // y = drawField(page, "Konsentrasi Keahlian", `${resultDetails?.job.work_unit}`, 40, y, font, FONTS.s);
        y = drawField(page, "Alamat Sekolah", `${resultDetails?.job.address}`, 40, y, font, FONTS.s);
        y = drawField(page, "No Telpon Sekolah", `${resultDetails?.job.phone_no}`, 40, y, font, FONTS.s);
        y = drawField(page, "Email Sekolah", `${resultDetails?.job.job_email}`, 40, y, font, FONTS.s);

        // === PAGE BREAK ===
        ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));

        // ==== SECTION 2 ====
        page.drawText(
            "Bagian 2 : Data Sertifikasi",
            { x: 40, y, size: FONTS.s, font: fontBold, maxWidth: 520, lineHeight: 14 }
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
            { x: 40, y, size: FONTS.s, font: font, maxWidth: 520, lineHeight: 14 }
        );
        y -= 20;

        drawSchemeTableHeader(page, y, resultDetails?.assessment, fontBold, FONTS.s, rgb(0, 0, 0));
        y -= 80;

        drawUnitTable(page, y, resultDetails?.assessment?.uc_apl02s || [], font, fontBold, FONTS.s, rgb(0, 0, 0));

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
                { label: "Rapor Semester 1 s.d. 5", memenuhi: true },
                { label: "Sertifikat Praktek Kerja Lapangan (PKL)", memenuhi: true },
            ],
            40, y, 20, font, fontIcon
        );

        y -= 25;

        page.drawText("3.2. Bukti Administratif", { x: 40, y, size: FONTS.s, font: fontBold });
        y -= 10;
        y = await drawChecklistTable(
            page,
            [
                { label: "Kartu Keluarga", memenuhi: true },
                { label: "Foto", memenuhi: true },
            ],
            40, y, 20, font, fontIcon
        );

        y -= 20;



        return await pdfDoc.save();

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
                    width: w - BOTTOM_MARGIN,
                    height: 30,
                    borderColor: color,
                    borderWidth: 1,
                });
                const value = field === "name" ? data?.occupation?.name?.toUpperCase() : data?.code || "-";
                drawParagraph(page, value, 215, y - 20 - 30 * i, fontBold, fontSize);
            });
        }

        function drawUnitTable(page: PDFPage, y: number, data: any[], font: PDFFont, fontBold: PDFFont, fontSize: number, color: RGB) {
            const x = 40;
            const width = page.getWidth() - 80;
            const rowHeight = 20;
            const col = { no: 30, code: 120, title: width - BOTTOM_MARGIN };

            // Header
            page.drawRectangle({ x, y: y - rowHeight, width, height: rowHeight, borderColor: color, borderWidth: 1 });
            page.drawRectangle({ x: x + col.no, y: y - rowHeight, width: col.code, height: rowHeight, borderColor: color, borderWidth: 1 });
            page.drawRectangle({ x: x + col.no + col.code, y: y - rowHeight, width: col.title, height: rowHeight, borderColor: color, borderWidth: 1 });

            drawParagraph(page, "NO", x + 10, y - 15, fontBold, fontSize);
            drawParagraph(page, "KODE UNIT", x + col.no + 10, y - 15, fontBold, fontSize);
            drawParagraph(page, "JUDUL UNIT", x + col.no + col.code + 10, y - 15, fontBold, fontSize);

            // Rows
            data.forEach((result, i) => {
                const rowY = y - rowHeight - (i + 1) * rowHeight;
                page.drawRectangle({ x, y: rowY, width, height: rowHeight, borderColor: color, borderWidth: 1 });
                page.drawLine({ start: { x: x + col.no, y: rowY }, end: { x: x + col.no, y: rowY + rowHeight }, thickness: 1, color });
                page.drawLine({ start: { x: x + col.no + col.code, y: rowY }, end: { x: x + col.no + col.code, y: rowY + rowHeight }, thickness: 1, color });

                drawParagraph(page, `${i + 1}`, x + 10, rowY + 5, font, fontSize);
                drawParagraph(page, `${result?.unit_code || "-"}`, x + col.no + 10, rowY + 5, font, fontSize);
                drawParagraph(page, `${result?.title || "-"}`, x + col.no + col.code + 10, rowY + 5, font, fontSize);
            });
        }
    }

    static async generateAK02(resultId: number) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { page, y } = await createNewPage(pdfDoc, headerImage, fontBold);

        const resultDetails = await AK02Service.getResultDetails(resultId);

        // === TITLE ===
        page.drawText("FR.AK.02 - REKAMAN ASESMEN KOMPETENSI", {
            x: 40, y, size: 12, font: fontBold
        });
        y -= 30;

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
            "Pernyataan Pihak Ketiga",
            "Pernyataan Wawancara",
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
            `${row.unit_code} - ${row.unit_title}`,
            ...selectedEvidences[i].map((selected) => selected ? "V" : ""),
        ]);

        const tableData = [...tableHeader, ...tableRows];
        y = await drawTable(page, tableData, [100, ...Array(8).fill(420 / 8)], 40, y, 25, font, fontBold);
        y -= 30;

        y = await drawFeedbackAK02(pdfDoc, page, resultDetails, 40, y, font, fontBold);

        return await pdfDoc.save();
    }


}
