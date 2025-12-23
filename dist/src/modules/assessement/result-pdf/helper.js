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
exports.drawElementApl02Layout = drawElementApl02Layout;
exports.drawFeedbackAPL02 = drawFeedbackAPL02;
exports.measureUnitLayoutHeight = measureUnitLayoutHeight;
exports.measureElementLayoutHeight = measureElementLayoutHeight;
exports.createNewPage = createNewPage;
exports.drawCellText = drawCellText;
exports.drawTable = drawTable;
exports.drawCertificateLayout = drawCertificateLayout;
exports.drawUnitGroupLayout = drawUnitGroupLayout;
exports.drawUnitLayout = drawUnitLayout;
exports.drawElementIa01Layout = drawElementIa01Layout;
exports.drawFeedbackIA01 = drawFeedbackIA01;
exports.drawSignatureAPL01 = drawSignatureAPL01;
exports.drawChecklistTable = drawChecklistTable;
exports.drawCertificateLayoutAK02 = drawCertificateLayoutAK02;
exports.drawFeedbackAK02 = drawFeedbackAK02;
exports.drawFeedbackAK01 = drawFeedbackAK01;
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
const headerImage = "../../public/images/kop-surat-lsp-smkn24j.png";
function createNewPage(pdfDoc, headerImage, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = pdfDoc.addPage([F4_WIDTH, F4_HEIGHT]);
        let y = yield (0, pdfAssets_helper_1.kopSurat)(pdfDoc, page, headerImage);
        y -= 10;
        return { page, y };
    });
}
function calculateTextHeight(text, maxWidth, font, fontSize, paddingY = Math.ceil(fontSize * 0.7), lineGap = Math.ceil(fontSize * 0.3)) {
    if (!text)
        return fontSize + lineGap + paddingY;
    const paragraphs = text.split("\n");
    let lines = 0;
    for (const paragraph of paragraphs) {
        const words = paragraph.split(" ");
        let line = "";
        for (const word of words) {
            const testLine = line ? line + " " + word : word;
            if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth - 8) {
                lines++;
                line = word;
            }
            else {
                line = testLine;
            }
        }
        if (line)
            lines++;
    }
    return lines * (fontSize + lineGap) + paddingY;
}
function calculateMultilineHeight(texts, width, font, fontSize, itemGap = 2) {
    let height = 0;
    for (const text of texts) {
        height += calculateTextHeight(text, width, font, fontSize, 0);
        height += fontSize * 0.3 - 0.4;
    }
    return height;
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
        return size + 2;
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
function drawTable(page_1, pdfDoc_1, data_1, colWidths_1, startX_1, startY_1, rowHeight_1, font_1, fontBold_1) {
    return __awaiter(this, arguments, void 0, function* (page, pdfDoc, data, colWidths, startX, startY, rowHeight, font, fontBold, bottomMargin = 150, fontSize = 9, firstRowCenterAlign = "center", isFirstRowBold = true) {
        let y = startY;
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let x = startX;
            let maxRowHeight = rowHeight;
            // ukur tinggi maksimum row (karena ada teks wrap)
            const cellHeights = row.map((cell, idx) => {
                if (Array.isArray(cell))
                    return calculateMultilineHeight(cell, colWidths[idx], font, fontSize);
                else
                    return calculateTextHeight(cell !== null && cell !== void 0 ? cell : "", colWidths[idx], font, fontSize);
                // const safeCell = cell ?? ""; // fallback
                // const words = safeCell.split(" ");
                // let line = "";
                // let lines: string[] = [];
                // for (const word of words) {
                //     const testLine = line ? line + " " + word : word;
                //     const testWidth = font.widthOfTextAtSize(testLine, fontSize);
                //     if (testWidth > colWidths[idx] - 8) {
                //         lines.push(line);
                //         line = word;
                //     } else {
                //         line = testLine;
                //     }
                // }
                // if (line) lines.push(line);
                // return lines.length * (fontSize + 4) + 6;
            });
            maxRowHeight = Math.max(rowHeight, ...cellHeights);
            if (y - maxRowHeight < bottomMargin) {
                ({ page, y } = yield createNewPage(pdfDoc, headerImage, fontBold));
            }
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
                const align = i === 0 ? firstRowCenterAlign : "left"; // Header alignment
                if (Array.isArray(cell)) {
                    let textY = y;
                    for (const line of cell) {
                        textY -= drawCellText(page, line, x, textY, w, maxRowHeight, (i === 0 && isFirstRowBold) ? fontBold : font, fontSize, align);
                    }
                }
                else
                    drawCellText(page, cell, x, y, w, maxRowHeight, (i === 0 && isFirstRowBold) ? fontBold : font, fontSize, align);
                x += w;
            });
            y -= maxRowHeight;
        }
        return { page, y };
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
function drawUnitGroupLayout(page, pdfDoc, index, group, startX, startY, rowHeight, font, fontBold) {
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
        ({ page, y } = yield drawTable(page, pdfDoc, mergedData, colWidths, headerX, y, rowHeight, font, fontBold));
        page.drawRectangle({
            x: startX,
            y: y - (y - headerY),
            width: headerWidth,
            height: y - headerY,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
        const titleY = y - (y - headerY) / 2 + rowHeight * (group.units.length + 1) / (group.units.length % 2 === 0 ? 6 : 4);
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
                drawCellText(page, cell, x, y, w, maxRowHeight, font, 9, align);
                x += w;
            });
            y -= maxRowHeight;
        }
        return y;
    });
}
function drawElementApl02Layout(pdfDoc, page, unitNo, elements, startX, startY, font, fontBold, headerImage, bottomMargin) {
    return __awaiter(this, void 0, void 0, function* () {
        const colWidths = [330, 32.5, 32.5, 125];
        const rowHeight = 20;
        let y = startY;
        // === DRAW HEADER ===
        const drawHeader = () => {
            const mainHeader = ["Dapatkah Saya?", "K", "BK", "Bukti Relevan"];
            let headerX = startX;
            let maxRowHeight = rowHeight;
            mainHeader.forEach((cell, idx) => {
                const w = colWidths[idx];
                page.drawRectangle({
                    x: headerX,
                    y: y - maxRowHeight,
                    width: w,
                    height: maxRowHeight,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                const align = idx === 0 ? "left" : "center";
                drawCellText(page, cell, headerX, y, w, maxRowHeight, fontBold, 9, align);
                headerX += w;
            });
            y -= maxRowHeight;
        };
        function buildElementText(elementNo, elementTitle, criterias) {
            const sb = [];
            sb.push(`${elementNo}. Elemen : ${elementTitle}`);
            sb.push("Kriteria Unjuk Kerja:");
            criterias.forEach((kriteria, idx) => {
                sb.push(`${unitNo}.${elementNo}.${idx + 1}. ${kriteria}`);
            });
            return sb;
        }
        // === DRAW ELEMENTS ===
        const data = elements.map((element, idx) => {
            var _a, _b, _c, _d, _e;
            return [
                buildElementText(idx + 1, element.title, element.details.map((detail) => detail.description)),
                ((_a = element.result) === null || _a === void 0 ? void 0 : _a.is_competent) ? "V" : "",
                !((_b = element.result) === null || _b === void 0 ? void 0 : _b.is_competent) ? "V" : "",
                (_e = (_d = (_c = element.result) === null || _c === void 0 ? void 0 : _c.evidences) === null || _d === void 0 ? void 0 : _d.map((evidence) => evidence.evidence).join(", ")) !== null && _e !== void 0 ? _e : "-",
            ];
        });
        drawHeader();
        ({ page, y } = yield drawTable(page, pdfDoc, data, colWidths, startX, y, rowHeight, font, fontBold, bottomMargin, 9, "left", false));
        return { page, y };
    });
}
function drawFeedbackAPL02(pdfDoc, page, data, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        const maxWidth = 520;
        // === Rekomendasi kompeten ===
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
        let leftSectionY = y - 22;
        const recommendationText = data.apl02_header.is_continue ? "Asesmen dapat dilanjutkan" : "Asesmen tidak dapat dilanjutkan";
        leftSectionY = (0, pdfDraw_helper_1.drawParagraph)(page, recommendationText, startX + 5, leftSectionY - 3, font, 8.5, "left", (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth / 2 + startX - (startX + 5), 12);
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
        if (data.apl02_header.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.apl02_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
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
        if (data.apl02_header.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.apl02_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = rightSectionX;
        y -= rowHeight * 4;
        return y;
    });
}
function drawElementIa01Layout(pdfDoc, page, elements, startX, startY, font, fontBold, headerImage, bottomMargin) {
    return __awaiter(this, void 0, void 0, function* () {
        const colWidths = [20, 110, 170, 90, 65, 65]; // Lebar kolom sesuai gambar
        const rowHeight = 20;
        let y = startY;
        // === DRAW HEADER ===
        const drawHeader = () => {
            const mainHeader = [
                "No",
                "Elemen",
                "Kriteria Unjuk Kerja",
                "Standar Industri atau Tempat Kerja",
                "Pencapaian",
                "Penilaian Lanjut",
            ];
            let headerX = startX;
            let maxRowHeight = rowHeight;
            const cellHeights = mainHeader.map((cell, idx) => {
                const words = cell.split(" ");
                let line = "";
                let lines = [];
                for (const word of words) {
                    const test = line ? line + " " + word : word;
                    if (font.widthOfTextAtSize(test, 9) > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    }
                    else {
                        line = test;
                    }
                }
                if (line)
                    lines.push(line);
                return lines.length * (9 + 4) + 6;
            });
            maxRowHeight = Math.max(rowHeight, ...cellHeights) + 10;
            mainHeader.forEach((cell, idx) => {
                const w = colWidths[idx];
                page.drawRectangle({
                    x: headerX,
                    y: y - maxRowHeight,
                    width: w,
                    height: maxRowHeight,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, cell, headerX, y, w, maxRowHeight, fontBold, 9, "center");
                if (idx === 4) {
                    const half = w / 2;
                    page.drawRectangle({ x: headerX, y: y - maxRowHeight, width: half, height: maxRowHeight / 2, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                    page.drawRectangle({ x: headerX + half, y: y - maxRowHeight, width: half, height: maxRowHeight / 2, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                    drawCellText(page, "Ya", headerX, y - maxRowHeight / 2, half, maxRowHeight, fontBold, 9, "center");
                    drawCellText(page, "Tidak", headerX + half, y - maxRowHeight / 2, half, maxRowHeight, fontBold, 9, "center");
                }
                headerX += w;
            });
            y -= maxRowHeight;
        };
        drawHeader();
        // === DRAW ELEMENTS ===
        const data = elements.map((element, idx) => [
            `${idx + 1}`,
            element.title,
            element.details.map((detail) => detail.description),
            element.details[0].benchmark,
            element.details.map((detail) => { var _a; return ((_a = detail.result) === null || _a === void 0 ? void 0 : _a.is_competent) ? "Ya" : "Tidak"; }),
            element.details.map((detail) => { var _a, _b; return (_b = (_a = detail.result) === null || _a === void 0 ? void 0 : _a.evaluation) !== null && _b !== void 0 ? _b : "-"; }),
        ]);
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let x = startX;
            let maxRowHeight = rowHeight;
            const detailsHeights = [];
            // Hitung tinggi per cell
            const cellHeights = row.map((cell, idx) => {
                if (Array.isArray(cell)) {
                    const heights = cell.map((detail) => {
                        const safeText = detail !== null && detail !== void 0 ? detail : "";
                        const words = safeText.split(" ");
                        let line = "";
                        let lines = [];
                        for (const word of words) {
                            const testLine = line ? line + " " + word : word;
                            const maxWidth = (idx === 4)
                                ? colWidths[idx] / 2 - 8
                                : colWidths[idx] - 8;
                            const testWidth = font.widthOfTextAtSize(testLine, 9);
                            if (testWidth > maxWidth) {
                                lines.push(line);
                                line = word;
                            }
                            else {
                                line = testLine;
                            }
                        }
                        if (line)
                            lines.push(line);
                        return Math.max(lines.length * (9 + 4) + 6, rowHeight);
                    });
                    detailsHeights.push(heights);
                    const totalHeight = heights.reduce((a, b) => a + b, 0);
                    return totalHeight;
                }
                else {
                    const safeCell = cell !== null && cell !== void 0 ? cell : "";
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
            // Hitung tinggi sejajar untuk setiap baris detail
            const detailCount = Math.max(...detailsHeights.map(h => h.length));
            const detailRowHeights = [];
            for (let d = 0; d < detailCount; d++) {
                const maxHeight = Math.max(rowHeight, ...detailsHeights.map(h => { var _a; return (_a = h[d]) !== null && _a !== void 0 ? _a : rowHeight; }));
                detailRowHeights.push(maxHeight);
            }
            maxRowHeight = Math.max(rowHeight, detailRowHeights.reduce((a, b) => a + b, 0));
            if (y - maxRowHeight < bottomMargin) {
                ({ page, y } = yield createNewPage(pdfDoc, headerImage, fontBold));
            }
            row.forEach((cell, idx) => {
                const w = colWidths[idx];
                const align = idx === 3 || idx === 4 ? "center" : "left";
                page.drawRectangle({
                    x,
                    y: y - maxRowHeight,
                    width: w,
                    height: maxRowHeight,
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                if (Array.isArray(cell)) {
                    let currentY = y;
                    cell.forEach((detail, detIdx) => {
                        const detailHeight = detailRowHeights[detIdx];
                        if (idx === 4) {
                            // Kolom hasil (Ya/Tidak) dibagi dua
                            let colX = x;
                            const halfW = w / 2;
                            page.drawRectangle({ x: colX, y: currentY - detailHeight, width: halfW, height: detailHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                            drawCellText(page, detail === "Ya" ? "V" : "", colX, currentY, halfW, detailHeight, font, 9, align);
                            colX += halfW;
                            page.drawRectangle({ x: colX, y: currentY - detailHeight, width: halfW, height: detailHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                            drawCellText(page, detail === "Tidak" ? "V" : "", colX, currentY, halfW, detailHeight, font, 9, align);
                        }
                        else {
                            page.drawRectangle({ x, y: currentY - detailHeight, width: w, height: detailHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                            drawCellText(page, detail, x, currentY, w, detailHeight, font, 9, align);
                        }
                        currentY -= detailHeight;
                    });
                }
                else {
                    drawCellText(page, cell, x, y, w, maxRowHeight, font, 9, align);
                }
                x += w;
            });
            y -= maxRowHeight;
        }
        return { page, y };
    });
}
function measureUnitLayoutHeight() {
    // estimasi aman drawUnitLayout
    // 2 baris header + padding
    return 20 * 4;
}
function measureElementLayoutHeight(elements, font) {
    var _a;
    const colWidths = [20, 110, 170, 90, 65, 65];
    const rowHeight = 20;
    let totalHeight = 0;
    // header
    totalHeight += 40; // header element (estimasi aman)
    // rows
    for (const element of elements) {
        const detailCount = element.details.length;
        let rowTotal = 0;
        for (const detail of element.details) {
            // estimasi tinggi per detail
            const text = (_a = detail.description) !== null && _a !== void 0 ? _a : "";
            const words = text.split(" ");
            let lines = 1;
            let line = "";
            for (const word of words) {
                const test = line ? line + " " + word : word;
                if (font.widthOfTextAtSize(test, 9) > colWidths[2] - 8) {
                    lines++;
                    line = word;
                }
                else {
                    line = test;
                }
            }
            rowTotal += Math.max(lines * (9 + 4) + 6, rowHeight);
        }
        totalHeight += Math.max(rowHeight, rowTotal);
    }
    return totalHeight;
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
        if (data.ia01_header.approved_assessee) {
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
        if (data.ia01_header.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.ia01_header.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = rightSectionX;
        y -= rowHeight * 4;
        return y;
    });
}
function drawChecklistTable(page, items, startX, startY, rowHeight, font, fontIcon) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        const colWidths = [30, 200, 180, 80];
        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        const headerHeight = rowHeight * 2;
        page.drawRectangle({
            x: startX,
            y: y - headerHeight,
            width: totalWidth,
            height: headerHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        let tempX = startX;
        for (let i = 0; i < colWidths.length; i++) {
            tempX += colWidths[i];
            page.drawLine({
                start: { x: tempX, y },
                end: { x: tempX, y: y - headerHeight },
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
                thickness: 1,
            });
        }
        page.drawLine({
            start: { x: startX + colWidths[0] + colWidths[1], y: y - rowHeight },
            end: { x: startX + colWidths[0] + colWidths[1] + colWidths[2], y: y - rowHeight },
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
            thickness: 1,
        });
        const adaX = startX + colWidths[0] + colWidths[1];
        const adaWidth = colWidths[2];
        const subAdaWidth = adaWidth / 2;
        page.drawLine({
            start: { x: adaX + subAdaWidth, y: y - rowHeight },
            end: { x: adaX + subAdaWidth, y: y - headerHeight },
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
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
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1,
            });
            let tempX2 = startX;
            for (let j = 0; j < colWidths.length; j++) {
                tempX2 += colWidths[j];
                page.drawLine({
                    start: { x: tempX2, y },
                    end: { x: tempX2, y: y - rowHeight },
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    thickness: 1,
                });
            }
            page.drawLine({
                start: { x: adaX + subAdaWidth, y },
                end: { x: adaX + subAdaWidth, y: y - rowHeight },
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
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
                    borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                    borderWidth: 1,
                });
                if (item[pos.key]) {
                    drawCellText(page, "✓", pos.x, y + rowHeight - boxSize + 4, boxSize, rowHeight, fontIcon, 10, "center");
                }
            }
            y -= rowHeight;
        }
        return y - 15;
    });
}
function drawCertificateLayoutAK02(page, data, colWidths, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        let y = startY;
        let footerX = startX;
        const footerText = "Tanggal Asesmen";
        const w = 90;
        const footerData = data.splice(-2);
        y = yield drawCertificateLayout(page, data, colWidths, startX, startY, rowHeight, font, fontBold);
        page.drawRectangle({
            x: footerX,
            y: y - rowHeight * 2,
            width: w,
            height: rowHeight * 2,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        const align = "center";
        drawCellText(page, footerText, footerX, y - rowHeight / 2 + rowHeight / 4, w, rowHeight * 2, fontBold, 9, align);
        footerX += w;
        for (let i = 0; i < footerData.length; i++) {
            const row = footerData[i];
            let x = footerX;
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
        return y;
    });
}
function drawFeedbackAK02(pdfDoc, page, data, startX, startY, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableWidth = 520;
        const rowHeight = 20;
        const qrSize = 60;
        let y = startY;
        // === Header rows ===
        const rows = [
            ["Rekomendasi Hasil Asesmen", ":", (data.ak02_headers.is_competent) ? "Kompeten" : "Belum Kompeten"],
            [
                "Tindak lanjut yang dibutuhkan (Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)",
                ":",
                data.ak02_headers.follow_up || "-",
            ],
            [
                "Komentar/ Observasi oleh asesor",
                ":",
                data.ak02_headers.comments || "-",
            ],
        ];
        ({ page, y } = yield drawTable(page, pdfDoc, rows, [200, 11, 309], startX, y, rowHeight, font, fontBold, 150, 9, "left", false));
        let rowX = startX;
        // == Asesi ==
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Asesi:", startX, y, tableWidth, rowHeight, fontBold, 9, "left");
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Nama", rowX, y, tableWidth / 3, rowHeight, font, 9, "left");
        rowX += tableWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth * 2 / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, data.assessee.name, rowX, y, tableWidth * 2 / 3, rowHeight, fontBold, 9, "left");
        rowX = startX;
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: tableWidth / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Tanda Tangan/ Tanggal", rowX, y, tableWidth / 3, rowHeight, font, 9, "left");
        rowX += tableWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: tableWidth * 2 / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (data.ak02_headers.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            const startXQr = rowX + ((startX * 2 / 3) - qrSize) + qrSize * 2 / 3;
            page.drawImage(asesiQrImage, { x: startXQr, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.ak02_headers.updated_at), rowX, y - qrSize, tableWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = startX;
        y -= rowHeight * 4;
        // Assessor
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Asesor:", startX, y, tableWidth, rowHeight, fontBold, 9, "left");
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Nama", rowX, y, tableWidth / 3, rowHeight, font, 9, "left");
        rowX += tableWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth * 2 / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, data.assessor.name, rowX, y, tableWidth * 2 / 3, rowHeight, fontBold, 9, "left");
        rowX = startX;
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "No Reg.", rowX, y, tableWidth / 3, rowHeight, font, 9, "left");
        rowX += tableWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight,
            width: tableWidth * 2 / 3,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, data.assessor.no_reg_met, rowX, y, tableWidth * 2 / 3, rowHeight, fontBold, 9, "left");
        rowX = startX;
        y -= rowHeight;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: tableWidth / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Tanda Tangan/ Tanggal", rowX, y, tableWidth / 3, rowHeight, font, 9, "left");
        rowX += tableWidth / 3;
        page.drawRectangle({
            x: rowX,
            y: y - rowHeight * 4,
            width: tableWidth * 2 / 3,
            height: rowHeight * 4,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (data.ak02_headers.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            const startXQr = rowX + ((startX * 2 / 3) - qrSize) + qrSize * 2 / 3;
            page.drawImage(asesiQrImage, { x: startXQr, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.ak02_headers.updated_at), rowX, y - qrSize, tableWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = startX;
        y -= rowHeight * 4;
        return y;
    });
}
function drawSignatureAPL01(pdfDoc, page, data, startX, startY, rowHeight, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let y = startY;
        const maxWidth = 520;
        const leftSectionWidth = maxWidth / 2;
        const leftSectionX = startX;
        const initialY = y;
        const leftSectionHeight = rowHeight * 12;
        page.drawRectangle({
            x: leftSectionX,
            y: y - leftSectionHeight,
            width: leftSectionWidth,
            height: leftSectionHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        page.drawText("Rekomendasi", {
            x: leftSectionX + 5,
            y: y - 12,
            size: 9,
            font: fontBold,
        });
        (0, pdfDraw_helper_1.drawMixedParagraph)(page, [
            { text: "Berdasarkan ketentuan persyaratan dasar, maka pemohon: ", font: font },
            { text: "Diterima", font: fontBold },
            { text: " sebagai peserta sertifikasi", font: font },
        ], startX + 5, y - 22 - 3, 9, (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth / 2 + startX - (startX + 22), 12, "left");
        const catatanY = initialY - rowHeight * 6;
        page.drawLine({
            start: { x: leftSectionX, y: catatanY },
            end: { x: leftSectionX + leftSectionWidth, y: catatanY },
            thickness: 1,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText("Catatan:", {
            x: leftSectionX + 5,
            y: catatanY - 12,
            size: 9,
            font: fontBold,
        });
        (0, pdfDraw_helper_1.drawParagraph)(page, (_a = data.note) !== null && _a !== void 0 ? _a : "", leftSectionX + 5, catatanY - 24, font, 9, "left", (0, pdf_lib_1.rgb)(0, 0, 0), leftSectionWidth - 10, 12);
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
        drawCellText(page, "Pemohon/Kandidat", rightSectionX, y, rightSectionWidth, rowHeight, fontBold, 9, "left");
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
        drawCellText(page, data.full_name, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");
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
        if (data.resultDoc.approved) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.resultDoc.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
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
        drawCellText(page, "Admin LSP:", rightSectionX, y, rightSectionWidth, rowHeight, fontBold, 9, "left");
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
        drawCellText(page, data.admin.full_name, rowX, y, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "left");
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
        if (data.resultDoc.approved) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.admin.id)));
            page.drawImage(asesiQrImage, { x: rowX + ((rightSectionX * 2 / 3) / 2 - qrSize) + qrSize / 4, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, (0, date_helper_1.formatDate)(data.resultDoc.updated_at), rowX, y - qrSize, rightSectionWidth * 2 / 3, rowHeight, fontBold, 9, "center");
        rowX = rightSectionX;
        y -= rowHeight * 4;
        return y;
    });
}
function drawFeedbackAK01(pdfDoc, page, data, startX, startY, font, fontBold) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const tableWidth = 520;
        const rowHeight = 20;
        const qrSize = 60;
        const halfWidth = tableWidth / 2;
        let y = startY;
        // === HEADER PERNYATAAN ===
        page.drawRectangle({
            x: startX,
            y: y - rowHeight,
            width: halfWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Asesor", startX, y, halfWidth, rowHeight, fontBold, 9, "center");
        page.drawRectangle({
            x: startX + halfWidth,
            y: y - rowHeight,
            width: halfWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "Asesi", startX + halfWidth, y, halfWidth, rowHeight, fontBold, 9, "center");
        y -= rowHeight;
        // === PERNYATAAN ASESOR & ASESI ===
        const assessorStatement = "Menyatakan tidak akan membuka hasil pekerjaan yang saya peroleh karena penugasan saya sebagai Asesor dalam pekerjaan Asesmen kepada siapapun atau organisasi apapun selain kepada pihak yang berwenang sehubungan dengan kewajiban saya sebagai Asesor yang ditugaskan oleh LSP.";
        const assesseeStatement = "Saya setuju mengikuti asesmen dengan pemahaman bahwa informasi yang dikumpulkan hanya digunakan untuk pengembangan profesional dan hanya dapat diakses oleh orang tertentu saja.";
        // Hitung tinggi pernyataan
        const assessorHeight = calculateTextHeight(assessorStatement, halfWidth, font, 8, 10, 3);
        const assesseeHeight = calculateTextHeight(assesseeStatement, halfWidth, font, 8, 10, 3);
        const statementHeight = Math.max(assessorHeight, assesseeHeight, 60);
        // Draw statement boxes
        page.drawRectangle({
            x: startX,
            y: y - statementHeight,
            width: halfWidth,
            height: statementHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        (0, pdfDraw_helper_1.drawParagraph)(page, assessorStatement, startX + 5, y - 10, font, 8, "left", (0, pdf_lib_1.rgb)(0, 0, 0), halfWidth - 10, 10);
        page.drawRectangle({
            x: startX + halfWidth,
            y: y - statementHeight,
            width: halfWidth,
            height: statementHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        (0, pdfDraw_helper_1.drawParagraph)(page, assesseeStatement, startX + halfWidth + 5, y - 10, font, 8, "left", (0, pdf_lib_1.rgb)(0, 0, 0), halfWidth - 10, 10);
        y -= statementHeight;
        // === NAMA ASESOR & ASESI ===
        page.drawRectangle({
            x: startX,
            y: y - rowHeight,
            width: halfWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, `Nama: ${data.assessor.name}`, startX, y, halfWidth, rowHeight, font, 9, "left");
        page.drawRectangle({
            x: startX + halfWidth,
            y: y - rowHeight,
            width: halfWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, `Nama: ${data.assessee.name}`, startX + halfWidth, y, halfWidth, rowHeight, font, 9, "left");
        y -= rowHeight;
        // === NO REG ASESOR ===
        page.drawRectangle({
            x: startX,
            y: y - rowHeight,
            width: halfWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, `No. Reg: ${(_a = data.assessor.no_reg_met) !== null && _a !== void 0 ? _a : "-"}`, startX, y, halfWidth, rowHeight, font, 9, "left");
        page.drawRectangle({
            x: startX + halfWidth,
            y: y - rowHeight,
            width: halfWidth,
            height: rowHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        drawCellText(page, "", startX + halfWidth, y, halfWidth, rowHeight, font, 9, "left");
        y -= rowHeight;
        // === TANDA TANGAN ===
        const signatureHeight = rowHeight * 4;
        // Asesor signature
        page.drawRectangle({
            x: startX,
            y: y - signatureHeight,
            width: halfWidth,
            height: signatureHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (data.ak01_header.approved_assessor) {
            const asesorQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssessorUrl)(data.assessor.id)));
            const qrX = startX + (halfWidth / 2) - (qrSize / 2);
            page.drawImage(asesorQrImage, { x: qrX, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, `Tanda Tangan / ${(0, date_helper_1.formatDate)(data.ak01_header.updated_at)}`, startX, y - signatureHeight + 5, halfWidth, rowHeight, font, 8, "center");
        // Asesi signature
        page.drawRectangle({
            x: startX + halfWidth,
            y: y - signatureHeight,
            width: halfWidth,
            height: signatureHeight,
            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
            borderWidth: 1,
        });
        if (data.ak01_header.approved_assessee) {
            const asesiQrImage = yield pdfDoc.embedPng(yield (0, qrCode_helper_1.generateQrDataURL)((0, hashids_1.getAssesseeUrl)(data.assessee.id)));
            const qrX = startX + halfWidth + (halfWidth / 2) - (qrSize / 2);
            page.drawImage(asesiQrImage, { x: qrX, y: y - qrSize - 5, width: qrSize, height: qrSize });
        }
        drawCellText(page, `Tanda Tangan / ${(0, date_helper_1.formatDate)(data.ak01_header.updated_at)}`, startX + halfWidth, y - signatureHeight + 5, halfWidth, rowHeight, font, 8, "center");
        y -= signatureHeight;
        return y;
    });
}
