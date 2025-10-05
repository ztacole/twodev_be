import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { kopSurat } from "../../../helper/pdfAssets.helper";
import { elementIAResponse, GroupIA01Response } from "../ia-01/ia-01.type";
import { IA01Service } from "../ia-01/ia-01.service";
import { createNewPage, drawCertificateLayout, drawElementLayout, drawTable, drawUnitGroupLayout, drawUnitLayout } from "./helper";

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
            ["Tanggal", ":", resultDetails?.created_at?.toLocaleString() ?? "-"],
        ];
        y = await drawCertificateLayout(page, info, [132, 11, 377], 40, y, 20, font, fontBold);
        y -= 40;

        // ==== LOOP GROUPS ====
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];

            if (y < 150) {
                ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
            }
            
            y = await drawUnitGroupLayout(page, i, group, 40, y, 20, font, fontBold);
            y -= 20;

            // Loop unit
            for (const unit of group.units) {
                // Ambil elemen dan detail dari unit
                y = await drawUnitLayout(page, i, unit.unit_code, unit.title, 40, y, 20, font, fontBold);
                y -= 20;

                const elements = await IA01Service.getElementsByUnitId(resultId, unit.id);

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
                    ({ page, y } = await createNewPage(pdfDoc, headerImage, fontBold));
                }

                y = await drawElementLayout(page, elements, 40, y, font, fontBold);
                y -= 20;
            }
        }

        return await pdfDoc.save();
    }
}
