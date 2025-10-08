import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { kopSurat } from "../../../helper/pdfAssets.helper";
import { elementIAResponse, GroupIA01Response } from "../ia-01/ia-01.type";
import { skip } from "node:test";
import { generateQrDataURL } from "../../../helper/qrCode.helper";
import { drawParagraph } from "../../../helper/pdfDraw.helper";
import { getAssesseeUrl } from "../../../helper/hashids";
import { formatDate } from "../../../helper/date.helper";
import { IA01Service } from "../ia-01/ia-01.service";

// Ukuran F4 = 210mm x 330mm
const F4_WIDTH = 595.28;  // 210 mm
const F4_HEIGHT = 935.43; // 330 mm

async function createNewPage(pdfDoc: PDFDocument, headerImage: string, fontBold: any) {
    const page = pdfDoc.addPage([F4_WIDTH, F4_HEIGHT]);
    let y = await kopSurat(pdfDoc, page, headerImage);
    y -= 10;

    return { page, y };
}

function calculateTextHeight(text: string, maxWidth: number, font: PDFFont, fontSize: number): number {
    const words = text.split(" ");
    let line = "";
    let lines = 0;

    for (const word of words) {
        const testLine = line ? line + " " + word : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth - 8) {
            lines++;
            line = word;
        } else {
            line = testLine;
        }
    }
    if (line) lines++;

    return lines * (fontSize + 4) + 10;
}

function drawCellText(
    page: PDFPage,
    text: string | undefined,
    x: number,
    y: number,
    width: number,
    height: number,
    font: PDFFont,
    size = 9,
    align: "left" | "center" = "left"
) {
    const safeText = text ?? ""; // fallback
    const words = safeText.split(" ");
    let line = "";
    const lines: string[] = [];

    for (const word of words) {
        const testLine = line ? line + " " + word : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > width - 8) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }
    if (line) lines.push(line);

    if (text === "V") {
        const checkX = x + (width / 2) - (font.widthOfTextAtSize("V", size) / 2);
        const checkY = y - (height / 2) - (size / 2);

        page.drawText("V", {
            x: checkX,
            y: checkY,
            size: size,
            font: font,
        });
        return;
    }

    let ty = y - 5 - size;
    for (const l of lines) {
        let tx = x + 4;
        if (align === "center") {
            const textWidth = font.widthOfTextAtSize(l, size);
            tx = x + (width - textWidth) / 2;
        }
        page.drawText(l, { x: tx, y: ty, size, font });
        ty -= size + 2;
    }

    return lines.length * (size + 2);
}

async function drawTable(
    page: any,
    data: string[][],
    colWidths: number[],
    startX: number,
    startY: number,
    rowHeight: number,
    font: any,
    fontBold: any
) {
    let y = startY;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        let x = startX;
        let maxRowHeight = rowHeight;

        // ukur tinggi maksimum row (karena ada teks wrap)
        const cellHeights = row.map((cell, idx) => {
            const safeCell = cell ?? ""; // fallback
            const words = safeCell.split(" ");
            let line = "";
            let lines: string[] = [];
            for (const word of words) {
                const testLine = line ? line + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, 9);
                if (testWidth > colWidths[idx] - 8) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);
            return lines.length * (9 + 4) + 6;
        });

        maxRowHeight = Math.max(rowHeight, ...cellHeights);

        // draw cell
        row.forEach((cell, idx) => {
            const w = colWidths[idx];
            page.drawRectangle({
                x,
                y: y - maxRowHeight,
                width: w,
                height: maxRowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            const align = i === 0 ? "center" : "left"; // header rata tengah
            drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
            x += w;
        });

        y -= maxRowHeight;
    }

    return y;
}

async function drawCertificateLayout(
    page: any,
    data: string[][],
    colWidths: number[],
    startX: number,
    startY: number,
    rowHeight: number,
    font: any,
    fontBold: any
): Promise<number> {
    let y = startY;
    let headerX = startX;
    const headerText = "Skema Sertifikasi Okupasi"

    const w = 90;
    page.drawRectangle({
        x: headerX,
        y: y - rowHeight * 2,
        width: w,
        height: rowHeight * 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });
    const align = "center"
    drawCellText(page, headerText, headerX, y - rowHeight / 2 + rowHeight / 4, w, rowHeight * 2, fontBold, 9, align);
    headerX += w;

    // Header
    const headerData = data.splice(0, 2);
    for (let i = 0; i < headerData.length; i++) {
        const row = headerData[i];
        let x = headerX;
        let maxRowHeight = rowHeight;

        // ukur tinggi maksimum row (karena ada teks wrap)
        const cellHeights = row.map((cell, idx) => {
            const safeCell = cell ?? ""; // fallback
            const words = safeCell.split(" ");
            let line = "";
            let lines: string[] = [];
            for (const word of words) {
                const testLine = line ? line + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, 9);
                if (testWidth > colWidths[idx] - 8) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);
            return lines.length * (9 + 4) + 6;
        });

        maxRowHeight = Math.max(rowHeight, ...cellHeights);

        // draw cell
        row.forEach((cell, idx) => {
            const w = idx === 0 ? 42 : colWidths[idx];
            page.drawRectangle({
                x,
                y: y - maxRowHeight,
                width: w,
                height: maxRowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            const align = "left";
            drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
            x += w;
        });

        y -= maxRowHeight;
    }

    // Body
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        let x = startX;
        let maxRowHeight = rowHeight;

        // ukur tinggi maksimum row (karena ada teks wrap)
        const cellHeights = row.map((cell, idx) => {
            const safeCell = cell ?? ""; // fallback
            const words = safeCell.split(" ");
            let line = "";
            let lines: string[] = [];
            for (const word of words) {
                const testLine = line ? line + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, 9);
                if (testWidth > colWidths[idx] - 8) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);
            return lines.length * (9 + 4) + 6;
        });

        maxRowHeight = Math.max(rowHeight, ...cellHeights);

        // draw cell
        row.forEach((cell, idx) => {
            const w = colWidths[idx];
            page.drawRectangle({
                x,
                y: y - maxRowHeight,
                width: w,
                height: maxRowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            const align = "left";
            drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
            x += w;
        });

        y -= maxRowHeight;
    }

    return y;
}

async function drawUnitGroupLayout(
    page: PDFPage,
    index: number,
    group: GroupIA01Response,
    startX: number,
    startY: number,
    rowHeight: number,
    font: PDFFont,
    fontBold: PDFFont
): Promise<number> {
    let y = startY - 48;
    page.drawLine({ start: { x: 40, y: y + 18 }, end: { x: page.getWidth() - 40, y: y + 18 }, thickness: 1, color: rgb(0, 0, 0), opacity: 0.3 });
    page.drawText(`KELOMPOK PEKERJAAN ${index + 1}`, { x: 40, y: y, size: 11, font: fontBold });
    y -= 12;

    // Header
    const headerY = y;
    const headerWidth = 160;
    const headerX = startX + headerWidth;

    // Tabel unit
    const unitHeader = [["No", "Kode Unit", "Judul Unit"]];
    const unitRows = group.units.map((u, idx) => [String(idx + 1), u.unit_code, u.title]);
    const mergedData = [...unitHeader, ...unitRows];
    const colWidths = [20, 110, 230];

    y = await drawTable(page, mergedData, colWidths, headerX, y, rowHeight, font, fontBold);

    page.drawRectangle({
        x: startX,
        y: y - (y - headerY),
        width: headerWidth,
        height: y - headerY,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });
    const align = "center"
    const titleY = y - (y - headerY) / 2 + rowHeight * (group.units.length + 1) / (group.units.length % 2 === 0 ? 6 : 4)
    drawCellText(page, group.name, startX, titleY, headerWidth, y - headerY, fontBold, 9, align);

    return y;
}

async function drawUnitLayout(
    page: PDFPage,
    unitNumber: number,
    unitCode: string,
    unitTitle: string,
    startX: number,
    startY: number,
    rowHeight: number,
    font: PDFFont,
    fontBold: PDFFont
) {
    let y = startY;
    let headerX = startX;
    const headerText = "Unit Kompetensi " + (unitNumber);

    const w = 132;
    page.drawRectangle({
        x: headerX,
        y: y - rowHeight * 2,
        width: w,
        height: rowHeight * 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });
    const align = "center"
    const titleY = y - rowHeight / 2 + rowHeight / 16
    drawCellText(page, headerText, headerX, titleY, w, rowHeight * 2, fontBold, 9, align);
    headerX += w;

    const headerData = [
        ["Kode Unit", ":", unitCode],
        ["Judul Unit", ":", unitTitle],
    ];
    const colWidths = [60, 11, 317];

    for (let i = 0; i < headerData.length; i++) {
        const row = headerData[i];
        let x = headerX;
        let maxRowHeight = rowHeight;

        // ukur tinggi maksimum row (karena ada teks wrap)
        const cellHeights = row.map((cell, idx) => {
            const safeCell = cell ?? ""; // fallback
            const words = safeCell.split(" ");
            let line = "";
            let lines: string[] = [];
            for (const word of words) {
                const testLine = line ? line + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, 9);
                if (testWidth > colWidths[idx] - 8) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);
            return lines.length * (9 + 4) + 6;
        });

        maxRowHeight = Math.max(rowHeight, ...cellHeights);

        // draw cell
        row.forEach((cell, idx) => {
            const w = colWidths[idx];
            page.drawRectangle({
                x,
                y: y - maxRowHeight,
                width: w,
                height: maxRowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            const align = "left";
            drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
            x += w;
        });

        y -= maxRowHeight;
    }

    return y;
}

async function drawElementLayout(
    page: PDFPage,
    elements: any[],
    startX: number,
    startY: number,
    font: PDFFont,
    fontBold: PDFFont
): Promise<number> {
    const colWidths = [20, 110, 170, 90, 65, 65]; // Lebar kolom sesuai gambar
    const rowHeight = 20;
    let y = startY;

    // === DRAW HEADER ===
    const mainHeader = ["No", "Elemen", "Kriteria Unjuk Kerja", "Standar Industri atau Tempat Kerja", "Pencapaian", "Penilaian Lanjut"];

    const row = mainHeader;
    let headerX = startX;
    let maxRowHeight = rowHeight;

    // ukur tinggi maksimum row (karena ada teks wrap)
    const cellHeights = row.map((cell, idx) => {
        const safeCell = cell ?? ""; // fallback
        const words = safeCell.split(" ");
        let line = "";
        let lines: string[] = [];
        for (const word of words) {
            const testLine = line ? line + " " + word : word;
            const testWidth = font.widthOfTextAtSize(testLine, 9);
            if (testWidth > colWidths[idx] - 8) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }
        if (line) lines.push(line);
        return lines.length * (9 + 4) + 6;
    });

    maxRowHeight = Math.max(rowHeight, ...cellHeights) + 10;

    // draw cell
    row.forEach((cell, idx) => {
        const w = colWidths[idx];
        page.drawRectangle({
            x: headerX,
            y: y - maxRowHeight,
            width: w,
            height: maxRowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
        drawCellText(page, cell, headerX, y, w, maxRowHeight, fontBold, 9, align);

        if (idx === 4) {
            let persistanceX = headerX;
            const persistanceW = w / 2;
            page.drawRectangle({
                x: persistanceX,
                y: y - maxRowHeight,
                width: persistanceW,
                height: maxRowHeight / 2,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            drawCellText(page, "Ya", persistanceX, y - maxRowHeight / 2, persistanceW, maxRowHeight, fontBold, 9, align);

            persistanceX += persistanceW;

            page.drawRectangle({
                x: persistanceX,
                y: y - maxRowHeight,
                width: persistanceW,
                height: maxRowHeight / 2,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            drawCellText(page, "Tidak", persistanceX, y - maxRowHeight / 2, persistanceW, maxRowHeight, fontBold, 9, align);
        }

        headerX += w;
    });

    y -= maxRowHeight;

    // === DRAW ELEMENTS ===
    const data = elements.map((element: any, idx: number) => [
        `${idx + 1}`,
        element.title,
        element.details.map((detail: any) => detail.description),
        element.details[0].benchmark,
        element.details.map((detail: any) => detail.result?.is_competent ? "Ya" : "Tidak"),
        element.details.map((detail: any) => detail.result?.evaluation ?? "-"),
    ]);
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        let x = startX;
        let maxRowHeight = rowHeight;
        const detailsHeights: number[][] = [];

        // Hitung tinggi per cell
        const cellHeights = row.map((cell: any, idx: number) => {
            if (Array.isArray(cell)) {
                const heights = cell.map((detail: any) => {
                    const safeText = detail ?? "";
                    const words = safeText.split(" ");
                    let line = "";
                    let lines: string[] = [];

                    for (const word of words) {
                        const testLine = line ? line + " " + word : word;
                        const maxWidth = (idx === 4)
                            ? colWidths[idx] / 2 - 8
                            : colWidths[idx] - 8;
                        const testWidth = font.widthOfTextAtSize(testLine, 9);

                        if (testWidth > maxWidth) {
                            lines.push(line);
                            line = word;
                        } else {
                            line = testLine;
                        }
                    }
                    if (line) lines.push(line);
                    return Math.max(lines.length * (9 + 4) + 6, rowHeight);
                });

                detailsHeights.push(heights);
                const totalHeight = heights.reduce((a, b) => a + b, 0);
                return totalHeight;
            } else {
                const safeCell = cell ?? "";
                const words = safeCell.split(" ");
                let line = "";
                let lines: string[] = [];

                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, 9);
                    if (testWidth > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                if (line) lines.push(line);
                return lines.length * (9 + 4) + 6;
            }
        });

        // Hitung tinggi sejajar untuk setiap baris detail
        const detailCount = Math.max(...detailsHeights.map(h => h.length));
        const detailRowHeights: number[] = [];

        for (let d = 0; d < detailCount; d++) {
            const maxHeight = Math.max(
                rowHeight,
                ...detailsHeights.map(h => h[d] ?? rowHeight)
            );
            detailRowHeights.push(maxHeight);
        }

        maxRowHeight = Math.max(
            rowHeight,
            detailRowHeights.reduce((a, b) => a + b, 0)
        );

        row.forEach((cell: any, idx: number) => {
            const w = colWidths[idx];
            const align = idx === 3 || idx === 4 ? "center" : "left";

            page.drawRectangle({
                x,
                y: y - maxRowHeight,
                width: w,
                height: maxRowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });

            if (Array.isArray(cell)) {
                let currentY = y;

                cell.forEach((detail: any, detIdx: number) => {
                    const detailHeight = detailRowHeights[detIdx];
                    if (idx === 4) {
                        // Kolom hasil (Ya/Tidak) dibagi dua
                        let colX = x;
                        const halfW = w / 2;
                        page.drawRectangle({ x: colX, y: currentY - detailHeight, width: halfW, height: detailHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                        drawCellText(page, detail === "Ya" ? "V" : "", colX, currentY, halfW, detailHeight, font, 9, align);

                        colX += halfW;
                        page.drawRectangle({ x: colX, y: currentY - detailHeight, width: halfW, height: detailHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                        drawCellText(page, detail === "Tidak" ? "V" : "", colX, currentY, halfW, detailHeight, font, 9, align);
                    } else {
                        page.drawRectangle({ x, y: currentY - detailHeight, width: w, height: detailHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                        drawCellText(page, detail, x, currentY, w, detailHeight, font, 9, align);
                    }
                    currentY -= detailHeight;
                });
            } else {
                drawCellText(page, cell, x, y, w, maxRowHeight, font, 9, align);
            }

            x += w;
        });

        y -= maxRowHeight;
    }


    return y;
}

async function drawFeedbackIA01(
    pdfDoc: PDFDocument,
    page: PDFPage,
    data: any,
    startX: number,
    startY: number,
    rowHeight: number,
    font: PDFFont,
    fontBold: PDFFont
): Promise<number> {
    let y = startY;
    const maxWidth = 520;

    // === Kotak feedback ===
    page.drawRectangle({
        x: startX,
        y: y - 100,
        width: maxWidth,
        height: 90,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });

    // === Judul bagian umpan balik ===
    page.drawText("Umpan Balik Untuk Asesi:", {
        x: startX + 5,
        y: y - 25,
        size: 10,
        font: fontBold,
    });

    page.drawText(data.feedback || "Asesi telah menunjukkan kinerja yang memuaskan", {
        x: startX + 5,
        y: y - 40,
        size: 9,
        font,
    });

    // === Rekomendasi kompeten ===
    y -= 120;
    const leftRectY = y - 260;

    page.drawRectangle({
        x: startX,
        y: leftRectY,
        width: maxWidth / 2,
        height: 260,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });


    page.drawText("Rekomendasi:", { x: startX + 5, y: y - 12, size: 9, font: fontBold });

    // Kotak "Kompeten"
    page.drawRectangle({
        x: startX + 5,
        y: y - 22 - 5,
        width: 10,
        height: 10,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });
    if (data.ia01_header.is_competent) {
        page.drawText("V", { x: startX + 5 + 2, y: y - 22 - 4, size: 9, font: fontBold });
    }
    let leftSectionY = drawParagraph(page, "Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan KOMPETEN", startX + 22, y - 22 - 3, font, 9, "left", rgb(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);

    // Kotak "Belum Kompeten"
    page.drawRectangle({
        x: startX + 5,
        y: leftSectionY - 5,
        width: 10,
        height: 10,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });
    if (!data.ia01_header.is_competent) {
        page.drawText("V", { x: startX + 5 + 2, y: leftSectionY - 4, size: 9, font: fontBold });
    }
    leftSectionY = drawParagraph(page, "Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan BELUM KOMPETEN", startX + 22, leftSectionY - 3, font, 9, "left", rgb(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);
    leftSectionY = drawParagraph(page, "Pada kelompok pekerjaan:", startX + 22, leftSectionY - 3, font, 8.5, "left", rgb(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);

    if (!data.ia01_header.is_competent) {
        const uncompletedCriterias = await IA01Service.getIncompleteCriterias(data.id);
        let uncompletedCriteriasText = ``;
        uncompletedCriterias.forEach((criteria: any) => {
            uncompletedCriteriasText = `- ${criteria.name}`;
            leftSectionY = drawParagraph(page, uncompletedCriteriasText, startX + 22, leftSectionY - 3, font, 9, "left", rgb(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);

            if (leftSectionY >= leftRectY) return;

            // criteria.units.forEach((unit: any) => {
            //     uncompletedCriteriasText = `    - Unit Kompetensi ${unit.no}`;
            //     leftSectionY = drawParagraph(page, uncompletedCriteriasText, startX + 27, leftSectionY - 3, font, 9, "left", rgb(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);

            //     uncompletedCriteriasText = '';
            //     unit.elements.forEach((element: any) => {
            //         element.criterias.forEach((criteria: any) => {
            //             uncompletedCriteriasText += criteria.no + ', ';
            //         })
            //     })
            //     leftSectionY = drawParagraph(page, uncompletedCriteriasText.substring(0, uncompletedCriteriasText.length - 2), startX + 32, leftSectionY - 3, font, 9, "left", rgb(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);
            // })
        });
    }

    // == Right Section ==

    const rightSectionWidth = maxWidth / 2;
    const rightSectionX = startX + rightSectionWidth;
    const qrSize = 60;
    let rowX = rightSectionX;

    // == Asesi ==
    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "Asesi:", rightSectionX, y, rightSectionWidth, rowHeight, fontBold, 9, "left");

    y -= rowHeight;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth / 3,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "Nama", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");

    rowX += rightSectionWidth / 3;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth * 2 / 3,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, data.assessee.name, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");

    rowX = rightSectionX;
    y -= rowHeight;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight * 4,
        width: rightSectionWidth / 3,
        height: rowHeight * 4,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "Tanda Tangan/ Tanggal", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");

    rowX += rightSectionWidth / 3;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight * 4,
        width: rightSectionWidth * 2 / 3,
        height: rowHeight * 4,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })

    if (data.ia01_header.approved_assessee) {
        const asesiQrImage = await pdfDoc.embedPng(await generateQrDataURL(getAssesseeUrl(data.assessee.id)));
        page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
    }
    drawCellText(page, formatDate(data.ia01_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");

    rowX = rightSectionX;
    y -= rowHeight * 4;

    // Assessor
    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "Asesor:", rightSectionX, y, rightSectionWidth, rowHeight, fontBold, 9, "left");

    y -= rowHeight;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth / 3,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "Nama", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");

    rowX += rightSectionWidth / 3;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth * 2 / 3,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, data.assessor.name, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");

    rowX = rightSectionX;
    y -= rowHeight;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth / 3,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "No Reg.", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");

    rowX += rightSectionWidth / 3;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight,
        width: rightSectionWidth * 2 / 3,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, data.assessor.no_reg_met, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");

    rowX = rightSectionX;
    y -= rowHeight;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight * 4,
        width: rightSectionWidth / 3,
        height: rowHeight * 4,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })
    drawCellText(page, "Tanda Tangan/ Tanggal", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");

    rowX += rightSectionWidth / 3;

    page.drawRectangle({
        x: rowX,
        y: y - rowHeight * 4,
        width: rightSectionWidth * 2 / 3,
        height: rowHeight * 4,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })

    if (data.ia01_header.approved_assessee) {
        const asesiQrImage = await pdfDoc.embedPng(await generateQrDataURL(getAssesseeUrl(data.assessee.id)));
        page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
    }
    drawCellText(page, formatDate(data.ia01_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");

    rowX = rightSectionX;
    y -= rowHeight * 4;

    return y - 130;
}

async function drawChecklistTable(
    page: PDFPage,
    items: { label: string; memenuhi?: boolean, tidakMemenuhi?: boolean, tidakAda?: boolean }[],
    startX: number,
    startY: number,
    rowHeight: number,
    font: PDFFont,
    fontIcon: PDFFont
): Promise<number> {
    let y = startY;
    const colWidths = [30, 200, 180, 80];
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const headerHeight = rowHeight * 2;

    page.drawRectangle({
        x: startX,
        y: y - headerHeight,
        width: totalWidth,
        height: headerHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });
    let tempX = startX;
    for (let i = 0; i < colWidths.length; i++) {
        tempX += colWidths[i];
        page.drawLine({
            start: { x: tempX, y },
            end: { x: tempX, y: y - headerHeight },
            color: rgb(0, 0, 0),
            thickness: 1,
        });
    }

    page.drawLine({
        start: { x: startX + colWidths[0] + colWidths[1], y: y - rowHeight },
        end: { x: startX + colWidths[0] + colWidths[1] + colWidths[2], y: y - rowHeight },
        color: rgb(0, 0, 0),
        thickness: 1,
    });

    const adaX = startX + colWidths[0] + colWidths[1];
    const adaWidth = colWidths[2];
    const subAdaWidth = adaWidth / 2;

    page.drawLine({
        start: { x: adaX + subAdaWidth, y: y - rowHeight },
        end: { x: adaX + subAdaWidth, y: y - headerHeight },
        color: rgb(0, 0, 0),
        thickness: 1,
    });

    drawCellText(page, "No", startX, y - rowHeight / 2, colWidths[0], headerHeight, font, 8, "center");
    drawCellText(page, "Bukti Persyaratan Dasar", startX + colWidths[0], y - rowHeight / 2, colWidths[1], headerHeight, font, 8, "center");
    drawCellText(page, "Ada", adaX, y, adaWidth, rowHeight, font, 8, "center");
    drawCellText(page, "Memenuhi Syarat", adaX, y - rowHeight, subAdaWidth, rowHeight, font, 7, "center");
    drawCellText(page, "Tidak Memenuhi Syarat", adaX + subAdaWidth, y - rowHeight, subAdaWidth, rowHeight, font, 7, "center");
    drawCellText(page, "Tidak Ada", adaX + adaWidth, y - rowHeight / 2, colWidths[3], headerHeight, font, 8, "center");

    y -= headerHeight;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        page.drawRectangle({
            x: startX,
            y: y - rowHeight,
            width: totalWidth,
            height: rowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });

        let tempX2 = startX;
        for (let j = 0; j < colWidths.length; j++) {
            tempX2 += colWidths[j];
            page.drawLine({
                start: { x: tempX2, y },
                end: { x: tempX2, y: y - rowHeight },
                color: rgb(0, 0, 0),
                thickness: 1,
            });
        }

        page.drawLine({
            start: { x: adaX + subAdaWidth, y },
            end: { x: adaX + subAdaWidth, y: y - rowHeight },
            color: rgb(0, 0, 0),
            thickness: 1,
        });

        drawCellText(page, String(i + 1), startX, y, colWidths[0], rowHeight, font, 8, "center");
        drawCellText(page, item.label, startX + colWidths[0], y, colWidths[1], rowHeight, font, 8, "left");

        const boxSize = 10;
        const boxY = y - (rowHeight + boxSize) / 2;
        const boxPositions = [
            { x: adaX + (subAdaWidth - boxSize) / 2, key: "memenuhi" },
            { x: adaX + subAdaWidth + (subAdaWidth - boxSize) / 2, key: "tidakMemenuhi" },
            { x: adaX + adaWidth + (colWidths[3] - boxSize) / 2, key: "tidakAda" },
        ];

        for (const pos of boxPositions) {
            page.drawRectangle({
                x: pos.x,
                y: boxY,
                width: boxSize,
                height: boxSize,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });

            if ((item as any)[pos.key]) {
                drawCellText(page, "✓", pos.x, y + rowHeight - boxSize + 4, boxSize, rowHeight, fontIcon, 10, "center");
            }
        }

        y -= rowHeight;
    }

    return y - 15;
}

async function drawSignatureSectionLayout(
    page: PDFPage,
    items: {
        label: string,
        memenuhi?: boolean,
        tidakMemenuhi?: boolean,
        tidakAda?: boolean
    },
    startX: number,
    startY: number,
    rowHeight: number,
    font: PDFFont,
    fontIcon: PDFFont
) { }

export { createNewPage, drawTable, drawCertificateLayout, drawUnitGroupLayout, drawUnitLayout, drawElementLayout, drawFeedbackIA01, drawChecklistTable };