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
exports.createNewPage = createNewPage;
exports.drawTable = drawTable;
exports.drawCertificateLayout = drawCertificateLayout;
exports.drawUnitGroupLayout = drawUnitGroupLayout;
exports.drawUnitLayout = drawUnitLayout;
exports.drawElementLayout = drawElementLayout;
const pdf_lib_1 = require("pdf-lib");
const pdfAssets_helper_1 = require("../../../helper/pdfAssets.helper");
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
        let y = startY + 12;
        page.drawText(`KELOMPOK PEKERJAAN ${index + 1}`, { x: 40, y: startY, size: 11, font: fontBold });
        y -= 20;
        // Header
        let headerX = startX;
        const w = 160;
        page.drawRectangle({
            x: headerX,
            y: y - rowHeight * (group.units.length + 1),
            width: w,
            height: rowHeight * (group.units.length + 1),
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
        const titleY = y - rowHeight * (group.units.length + 1) / 2 + rowHeight * (group.units.length + 1) / (group.units.length % 2 === 0 ? 6 : 4);
        drawCellText(page, group.name, headerX, titleY, w, rowHeight * (group.units.length + 1), fontBold, 9, align);
        headerX += w;
        // Tabel unit
        const unitHeader = [["No", "Kode Unit", "Judul Unit"]];
        const unitRows = group.units.map((u, idx) => [String(idx + 1), u.unit_code, u.title]);
        const mergedData = [...unitHeader, ...unitRows];
        const colWidths = [30, 100, 230];
        y = yield drawTable(page, mergedData, colWidths, headerX, y, rowHeight, font, fontBold);
        return y;
    });
}
function drawUnitLayout(page, index, unitCode, unitTitle, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        let headerX = startX;
        const headerText = "Unit Kompetensi " + (index + 1);
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
        const colWidths = [30, 120, 150, 120, 40, 40, 80]; // Lebar kolom sesuai gambar
        const rowHeight = 25;
        let y = startY;
        // === DRAW HEADER ===
        const mainHeader = ["No", "Element", "Kriteria Unjuk Kerja", "Standar Industri atau Tempat Kerja", "Pencapaian", "", "Penilaian Lanjut"];
        const subHeader = ["", "", "", "", "Ya", "Tidak", ""];
        // Draw main header
        let x = startX;
        let currentY = y;
        // Main header row
        page.drawRectangle({
            x: startX,
            y: currentY - rowHeight,
            width: colWidths.reduce((a, b) => a + b, 0),
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        mainHeader.forEach((text, idx) => {
            const width = colWidths[idx];
            const align = idx === 0 ? "center" : "center";
            // Draw vertical separators
            if (idx > 0) {
                page.drawLine({
                    start: { x: x, y: currentY },
                    end: { x: x, y: currentY - rowHeight },
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    thickness: 1,
                });
            }
            drawCellText(page, text, x, currentY, width, rowHeight, fontBold, 9, align);
            x += width;
        });
        currentY -= rowHeight;
        // Draw sub header row
        x = startX;
        page.drawRectangle({
            x: startX,
            y: currentY - rowHeight,
            width: colWidths.reduce((a, b) => a + b, 0),
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        subHeader.forEach((text, idx) => {
            const width = colWidths[idx];
            const align = "center";
            if (idx > 0) {
                page.drawLine({
                    start: { x: x, y: currentY },
                    end: { x: x, y: currentY - rowHeight },
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    thickness: 1,
                });
            }
            // Special styling untuk kolom Pencapaian
            if (idx === 4 || idx === 5) {
                page.drawRectangle({
                    x: x,
                    y: currentY - rowHeight,
                    width: width,
                    height: rowHeight,
                    color: (0, pdf_lib_1.rgb)(0.9, 0.9, 0.9), // Background abu-abu
                });
            }
            drawCellText(page, text, x, currentY, width, rowHeight, fontBold, 9, align);
            x += width;
        });
        y = currentY - rowHeight;
        // === DRAW DATA ROWS ===
        elements.forEach((element, elementIndex) => {
            element.details.forEach((criteria, criteriaIndex) => {
                var _a, _b, _c, _d;
                if (y < 100) {
                    // Handle page break - perlu implementasi createNewPage
                    return y;
                }
                const isFirstKriteria = criteriaIndex === 0;
                const rowData = [
                    isFirstKriteria ? (elementIndex + 1).toString() : "",
                    isFirstKriteria ? element.title : "",
                    criteria.description,
                    criteria.benchmark,
                    ((_a = criteria.result) === null || _a === void 0 ? void 0 : _a.is_competent) ? "V" : "",
                    criteria.result && !((_b = criteria.result) === null || _b === void 0 ? void 0 : _b.is_competent) ? "V" : "",
                    (_d = (_c = criteria.result) === null || _c === void 0 ? void 0 : _c.evaluation) !== null && _d !== void 0 ? _d : "",
                ];
                x = startX;
                let maxCellHeight = rowHeight;
                // Calculate max height for this row
                const cellHeights = rowData.map((cell, idx) => {
                    return calculateTextHeight(cell, colWidths[idx], font, 9);
                });
                maxCellHeight = Math.max(rowHeight, ...cellHeights);
                // Draw row background and borders
                page.drawRectangle({
                    x: startX,
                    y: y - maxCellHeight,
                    width: colWidths.reduce((a, b) => a + b, 0),
                    height: maxCellHeight,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                // Draw cell content
                rowData.forEach((cell, idx) => {
                    const width = colWidths[idx];
                    const align = idx === 0 ? "center" : "left";
                    // Draw vertical separators
                    if (idx > 0) {
                        page.drawLine({
                            start: { x: x, y: y },
                            end: { x: x, y: y - maxCellHeight },
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            thickness: 1,
                        });
                    }
                    // Background untuk kolom Ya/Tidak
                    if (idx === 4 || idx === 5) {
                        page.drawRectangle({
                            x: x,
                            y: y - maxCellHeight,
                            width: width,
                            height: maxCellHeight,
                            color: (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95),
                        });
                    }
                    drawCellText(page, cell, x, y, width, maxCellHeight, font, 9, align);
                    x += width;
                });
                y -= maxCellHeight;
            });
        });
        return y;
    });
}
