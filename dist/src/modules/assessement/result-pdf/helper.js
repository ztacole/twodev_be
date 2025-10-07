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
exports.drawFeedbackIA01 = drawFeedbackIA01;
exports.createNewPage = createNewPage;
exports.drawTable = drawTable;
exports.drawCertificateLayout = drawCertificateLayout;
exports.drawUnitGroupLayout = drawUnitGroupLayout;
exports.drawUnitLayout = drawUnitLayout;
exports.drawElementLayout = drawElementLayout;
const pdf_lib_1 = require("pdf-lib");
const pdfAssets_helper_1 = require("../../../helper/pdfAssets.helper");
const qrCode_helper_1 = require("../../../helper/qrCode.helper");
const pdfDraw_helper_1 = require("../../../helper/pdfDraw.helper");
const hashids_1 = require("../../../helper/hashids");
const date_helper_1 = require("../../../helper/date.helper");
const ia_01_service_1 = require("../ia-01/ia-01.service");
// Ukuran F4 = 210mm x 330mm
const F4_WIDTH = 595.28; // 210 mm
const F4_HEIGHT = 935.43; // 330 mm
function createNewPage(pdfDoc, headerImage, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = pdfDoc.addPage([F4_WIDTH, F4_HEIGHT]);
        let y = yield (0, pdfAssets_helper_1.kopSurat)(pdfDoc, page, headerImage);
        y -= 10;
        return { page, y };
    });
}
function calculateTextHeight(text, maxWidth, font, fontSize) {
    const words = text.split(" ");
    let line = "";
    let lines = 0;
    for (const word of words) {
        const testLine = line ? line + " " + word : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth - 8) {
            lines++;
            line = word;
        }
        else {
            line = testLine;
        }
    }
    if (line)
        lines++;
    return lines * (fontSize + 4) + 10;
}
function drawCellText(page, text, x, y, width, height, font, size = 9, align = "left") {
    const safeText = text !== null && text !== void 0 ? text : ""; // fallback
    const words = safeText.split(" ");
    let line = "";
    const lines = [];
    for (const word of words) {
        const testLine = line ? line + " " + word : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > width - 8) {
            lines.push(line);
            line = word;
        }
        else {
            line = testLine;
        }
    }
    if (line)
        lines.push(line);
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
function drawTable(page, data, colWidths, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let x = startX;
            let maxRowHeight = rowHeight;
            // ukur tinggi maksimum row (karena ada teks wrap)
            const cellHeights = row.map((cell, idx) => {
                const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
                const words = safeCell.split(" ");
                let line = "";
                let lines = [];
                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, 9);
                    if (testWidth > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    }
                    else {
                        line = testLine;
                    }
                }
                if (line)
                    lines.push(line);
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
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                const align = i === 0 ? "center" : "left"; // header rata tengah
                drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
                x += w;
            });
            y -= maxRowHeight;
        }
        return y;
    });
}
function drawCertificateLayout(page, data, colWidths, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        let headerX = startX;
        const headerText = "Skema Sertifikasi Okupasi";
        const w = 90;
        page.drawRectangle({
            x: headerX,
            y: y - rowHeight * 2,
            width: w,
            height: rowHeight * 2,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
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
                const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
                const words = safeCell.split(" ");
                let line = "";
                let lines = [];
                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, 9);
                    if (testWidth > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    }
                    else {
                        line = testLine;
                    }
                }
                if (line)
                    lines.push(line);
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
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
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
                const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
                const words = safeCell.split(" ");
                let line = "";
                let lines = [];
                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, 9);
                    if (testWidth > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    }
                    else {
                        line = testLine;
                    }
                }
                if (line)
                    lines.push(line);
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
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                const align = "left";
                drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
                x += w;
            });
            y -= maxRowHeight;
        }
        return y;
    });
}
function drawUnitGroupLayout(page, index, group, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY - 48;
        page.drawLine({ start: { x: 40, y: y + 18 }, end: { x: page.getWidth() - 40, y: y + 18 }, thickness: 1, color: (0, pdf_lib_1.rgb)(0, 0, 0), opacity: 0.3 });
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
        y = yield drawTable(page, mergedData, colWidths, headerX, y, rowHeight, font, fontBold);
        page.drawRectangle({
            x: startX,
            y: y - (y - headerY),
            width: headerWidth,
            height: y - headerY,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
        const titleY = headerY - rowHeight * (group.units.length + 1) / 2 + rowHeight * (group.units.length + 1) / (group.units.length % 2 === 0 ? 6 : 4);
        drawCellText(page, group.name, startX, titleY, headerWidth, y - headerY, fontBold, 9, align);
        return y;
    });
}
function drawUnitLayout(page, unitNumber, unitCode, unitTitle, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        let headerX = startX;
        const headerText = "Unit Kompetensi " + (unitNumber);
        const w = 132;
        page.drawRectangle({
            x: headerX,
            y: y - rowHeight * 2,
            width: w,
            height: rowHeight * 2,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
        const titleY = y - rowHeight / 2 + rowHeight / 16;
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
                const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
                const words = safeCell.split(" ");
                let line = "";
                let lines = [];
                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, 9);
                    if (testWidth > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    }
                    else {
                        line = testLine;
                    }
                }
                if (line)
                    lines.push(line);
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
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                const align = "left";
                drawCellText(page, cell, x, y, w, maxRowHeight, i === 0 ? fontBold : font, 9, align);
                x += w;
            });
            y -= maxRowHeight;
        }
        return y;
    });
}
function drawElementLayout(page, elements, startX, startY, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        const colWidths = [20, 110, 170, 90, 65, 65]; // Lebar kolom sesuai gambar
        const rowHeight = 25;
        let y = startY;
        // === DRAW HEADER ===
        const mainHeader = ["No", "Elemen", "Kriteria Unjuk Kerja", "Standar Industri atau Tempat Kerja", "Pencapaian", "Penilaian Lanjut"];
        const row = mainHeader;
        let headerX = startX;
        let maxRowHeight = rowHeight;
        // ukur tinggi maksimum row (karena ada teks wrap)
        const cellHeights = row.map((cell, idx) => {
            const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
            const words = safeCell.split(" ");
            let line = "";
            let lines = [];
            for (const word of words) {
                const testLine = line ? line + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, 9);
                if (testWidth > colWidths[idx] - 8) {
                    lines.push(line);
                    line = word;
                }
                else {
                    line = testLine;
                }
            }
            if (line)
                lines.push(line);
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
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
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
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, "Ya", persistanceX, y - maxRowHeight / 2, persistanceW, maxRowHeight, fontBold, 9, align);
                persistanceX += persistanceW;
                page.drawRectangle({
                    x: persistanceX,
                    y: y - maxRowHeight,
                    width: persistanceW,
                    height: maxRowHeight / 2,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, "Tidak", persistanceX, y - maxRowHeight / 2, persistanceW, maxRowHeight, fontBold, 9, align);
            }
            headerX += w;
        });
        y -= maxRowHeight;
        // === DRAW ELEMENTS ===
        const data = elements.map((element, idx) => [
            `${idx + 1}`,
            element.title,
            element.details.map((detail) => detail.description),
            element.details[0].benchmark,
            element.details.map((detail) => { var _a; return ((_a = detail.result) === null || _a === void 0 ? void 0 : _a.is_competent) ? "Ya" : "Tidak"; }),
            element.details.map((detail) => { var _a; return (_a = detail.result) === null || _a === void 0 ? void 0 : _a.evaluation; }),
        ]);
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let x = startX;
            let maxRowHeight = rowHeight;
            // ukur tinggi maksimum row (karena ada teks wrap)
            const cellHeights = row.map((cell, idx) => {
                if (Array.isArray(cell)) {
                    const detailsHeights = cell.map((detail) => {
                        const safeCellArr = detail !== null && detail !== void 0 ? detail : ""; // fallback
                        const words = safeCellArr.split(" ");
                        let line = "";
                        let lines = [];
                        for (const word of words) {
                            const testLine = line ? line + " " + word : word;
                            const testWidth = font.widthOfTextAtSize(testLine, 9);
                            if (testWidth > ((idx === 4) ? colWidths[idx] / 2 - 8 : colWidths[idx] - 8)) {
                                lines.push(line);
                                line = word;
                            }
                            else {
                                line = testLine;
                            }
                        }
                        if (line)
                            lines.push(line);
                        return Math.max(lines.length * (9 + 4) + 6, rowHeight) + 10;
                    });
                    return detailsHeights.reduce((a, b) => a + b, 0);
                }
                else {
                    const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
                    const words = safeCell.split(" ");
                    let line = "";
                    let lines = [];
                    for (const word of words) {
                        const testLine = line ? line + " " + word : word;
                        const testWidth = font.widthOfTextAtSize(testLine, 9);
                        if (testWidth > colWidths[idx] - 8) {
                            lines.push(line);
                            line = word;
                        }
                        else {
                            line = testLine;
                        }
                    }
                    if (line)
                        lines.push(line);
                    return lines.length * (9 + 4) + 6;
                }
            });
            maxRowHeight = Math.max(rowHeight, ...cellHeights) + 10;
            // draw cell
            row.forEach((cell, idx) => {
                const w = colWidths[idx];
                page.drawRectangle({
                    x,
                    y: y - maxRowHeight,
                    width: w,
                    height: maxRowHeight,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                const align = idx === 3 || idx === 4 ? "center" : "left";
                if (Array.isArray(cell)) {
                    let persistanceY = y;
                    cell.forEach((detail) => {
                        if (idx === 4) {
                            let persistanceX = x;
                            let detailPersistanceY = persistanceY;
                            const persistanceW = w / 2;
                            page.drawRectangle({
                                x: persistanceX,
                                y: detailPersistanceY - maxRowHeight / cell.length,
                                width: persistanceW,
                                height: maxRowHeight / cell.length,
                                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                                borderWidth: 1,
                            });
                            drawCellText(page, detail === "Ya" ? "V" : "", persistanceX, detailPersistanceY, persistanceW, maxRowHeight / cell.length, font, 9, align);
                            persistanceX += persistanceW;
                            drawCellText(page, detail === "Tidak" ? "V" : "", persistanceX, detailPersistanceY, persistanceW, maxRowHeight / cell.length, font, 9, align);
                            detailPersistanceY -= maxRowHeight / cell.length;
                        }
                        page.drawRectangle({
                            x,
                            y: y - maxRowHeight / cell.length,
                            width: w,
                            height: maxRowHeight / cell.length,
                            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                            borderWidth: 1,
                        });
                        if (idx !== 4)
                            drawCellText(page, detail, x, persistanceY, w, maxRowHeight / cell.length, font, 9, align);
                        persistanceY -= maxRowHeight / cell.length;
                    });
                }
                else
                    drawCellText(page, cell, x, y, w, maxRowHeight, font, 9, align);
                x += w;
            });
            y -= maxRowHeight;
        }
        return y;
    });
}
function drawFeedbackIA01(pdfDoc, page, data, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        const maxWidth = 520;
        // === Kotak feedback ===
        page.drawRectangle({
            x: startX,
            y: y - 100,
            width: maxWidth,
            height: 90,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
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
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        page.drawText("Rekomendasi:", { x: startX + 5, y: y - 12, size: 9, font: fontBold });
        // Kotak "Kompeten"
        page.drawRectangle({
            x: startX + 5,
            y: y - 22 - 5,
            width: 10,
            height: 10,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (data.ia01_header.is_competent) {
            page.drawText("V", { x: startX + 5 + 2, y: y - 22 - 4, size: 9, font: fontBold });
        }
        let leftSectionY = (0, pdfDraw_helper_1.drawParagraph)(page, "Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan KOMPETEN", startX + 22, y - 22 - 3, font, 9, "left", (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);
        // Kotak "Belum Kompeten"
        page.drawRectangle({
            x: startX + 5,
            y: leftSectionY - 5,
            width: 10,
            height: 10,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (!data.ia01_header.is_competent) {
            page.drawText("V", { x: startX + 5 + 2, y: leftSectionY - 4, size: 9, font: fontBold });
        }
        leftSectionY = (0, pdfDraw_helper_1.drawParagraph)(page, "Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan BELUM KOMPETEN", startX + 22, leftSectionY - 3, font, 9, "left", (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);
        leftSectionY = (0, pdfDraw_helper_1.drawParagraph)(page, "Pada kelompok pekerjaan:", startX + 22, leftSectionY - 3, font, 8.5, "left", (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);
        if (!data.ia01_header.is_competent) {
            const uncompletedCriterias = yield ia_01_service_1.IA01Service.getIncompleteCriterias(data.id);
            let uncompletedCriteriasText = ``;
            uncompletedCriterias.forEach((criteria) => {
                uncompletedCriteriasText = `- ${criteria.name}`;
                leftSectionY = (0, pdfDraw_helper_1.drawParagraph)(page, uncompletedCriteriasText, startX + 22, leftSectionY - 3, font, 9, "left", (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12);
                if (leftSectionY >= leftRectY)
                    return;
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
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Asesi:", rightSectionX, y, rightSectionWidth, rowHeight, fontBold, 9, "left");
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Nama", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");
        rowX += rightSectionWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth * 2 / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, data.assessee.name, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");
        rowX = rightSectionX;
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: rightSectionWidth / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Tanda Tangan/ Tanggal", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");
        rowX += rightSectionWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: rightSectionWidth * 2 / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (!data.ia01_header.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.ia01_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = rightSectionX;
        y -= rowHeight * 4;
        // Assessor
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Asesor:", rightSectionX, y, rightSectionWidth, rowHeight, fontBold, 9, "left");
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Nama", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");
        rowX += rightSectionWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth * 2 / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, data.assessor.name, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");
        rowX = rightSectionX;
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "No Reg.", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");
        rowX += rightSectionWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: rightSectionWidth * 2 / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, data.assessor.no_reg_met, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");
        rowX = rightSectionX;
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: rightSectionWidth / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Tanda Tangan/ Tanggal", rowX, y, rightSectionWidth / 3, rowHeight, font, 9, "left");
        rowX += rightSectionWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: rightSectionWidth * 2 / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (!data.ia01_header.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.ia01_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = rightSectionX;
        y -= rowHeight * 4;
        return y - 130;
    });
}
