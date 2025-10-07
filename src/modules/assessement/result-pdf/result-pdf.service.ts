import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { kopSurat } from "../../../helper/pdfAssets.helper";
import { elementIAResponse, GroupIA01Response } from "../ia-01/ia-01.type";
import { IA01Service } from "../ia-01/ia-01.service";
import { createNewPage, drawCertificateLayout, drawElementLayout, drawFeedbackIA01, drawTable, drawUnitGroupLayout, drawUnitLayout } from "./helper";
import { formatDate, formatDay } from "../../../helper/date.helper";

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

            if (y < 150) {
                ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
            }

            y = await drawUnitGroupLayout(page, i, group, 40, y, 20, font, fontBold);

            // Loop unit
            let unitIdx = 0;
            for (const unit of group.units) {
                y -= 20;
                y = await drawUnitLayout(page, ++unitIdx, unit.unit_code, unit.title, 40, y, 20, font, fontBold);
                y -= 20;

                const elements = await IA01Service.getElementsByUnitId(resultId, unit.id);

                if (y < 150) {
                    ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
                }

                y = await drawElementLayout(page, elements, 40, y, font, fontBold);
            }
        }
        
        ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
        y = await drawFeedbackIA01(pdfDoc, page, resultDetails, 40, y, 20, font, fontBold);

        return await pdfDoc.save();
    }
}
