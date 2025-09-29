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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawParagraph = drawParagraph;
exports.drawMixedParagraph = drawMixedParagraph;
exports.loadAndEmbedImage = loadAndEmbedImage;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Draws a paragraph of text with a single font.
 * The text is split into multiple lines if necessary.
 * Supports alignment of left, right, center, and justify.
 *
 * @param page The PDF page to draw on.
 * @param text The text to draw.
 * @param startX The x-coordinate of the starting position.
 * @param startY The y-coordinate of the starting position.
 * @param font The font to use for drawing the text.
 * @param size The size of the font.
 * @param align The alignment of the text. One of "left", "right", "center", or "justify".
 * @param color The color of the text.
 * @param maxWidth The maximum width of the text before it wraps to a new line. If not provided, the text will wrap at the edge of the page.
 * @param lineHeight The height of each line of text. If not provided, it defaults to the font size plus 4.
 *
 * @returns The y-coordinate of the position after the last line of text has been drawn.
 */
function drawParagraph(page, text, startX, startY, font, size, align = "left", color = (0, pdf_lib_1.rgb)(0, 0, 0), maxWidth, lineHeight = size + 4) {
    var _a;
    const { width } = page.getSize();
    const usableWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : width - startX * 2;
    const words = text.split(" ");
    let line = "";
    let y = startY;
    for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        const testWidth = font.widthOfTextAtSize(testLine + " ", size) +
            font.widthOfTextAtSize(" ", size);
        // Jika panjang kalimat melebihi lebar halaman → turun baris
        if (testWidth > usableWidth && line) {
            drawLine(page, line, startX, y, font, size, align, color, usableWidth, width);
            y -= lineHeight;
            line = (_a = words[i]) !== null && _a !== void 0 ? _a : "";
        }
        else {
            line = testLine !== null && testLine !== void 0 ? testLine : "";
        }
    }
    // Baris terakhir → tidak justify
    if (line) {
        drawLine(page, line, startX, y, font, size, align === "justify" ? "left" : align, color, usableWidth, width);
        y -= lineHeight;
    }
    return y; // posisi Y terakhir setelah paragraf
}
/**
 * Draws a single line of text with a single font.
 * Supports alignment of left, right, center, and justify.
 * Helper function for drawParagraph.
 *
 * @param page The PDF page to draw on.
 * @param line The text to draw.
 * @param startX The x-coordinate of the starting position.
 * @param y The y-coordinate of the starting position.
 * @param font The font to use for drawing the text.
 * @param size The size of the font.
 * @param align The alignment of the text. One of "left", "right", "center", or "justify".
 * @param color The color of the text.
 * @param usableWidth The maximum width of the text before it wraps to a new line. If not provided, the text will wrap at the edge of the page.
 * @param pageWidth The width of the PDF page.
 *
 * @returns The y-coordinate of the position after the last line of text has been drawn.
 */
function drawLine(page, line, startX, y, font, size, align, color, usableWidth, pageWidth) {
    const words = line.split(" ");
    const lineWidth = font.widthOfTextAtSize(line, size);
    if (align === "justify" && words.length > 1) {
        // Mode justify: distribusikan spasi ekstra antar kata
        const spaceCount = words.length - 1;
        const totalSpaceWidth = usableWidth - (lineWidth - font.widthOfTextAtSize(" ", size) * spaceCount);
        const extraSpace = totalSpaceWidth / spaceCount;
        let x = startX;
        words.forEach((word, idx) => {
            page.drawText(word, { x, y, size, font, color });
            if (idx < words.length - 1) {
                x +=
                    font.widthOfTextAtSize(word, size) +
                        font.widthOfTextAtSize(" ", size) +
                        extraSpace;
            }
        });
    }
    else {
        // Mode left, center, right
        let x;
        switch (align) {
            case "center":
                x = (pageWidth - lineWidth) / 2;
                break;
            case "right":
                x = pageWidth - startX - lineWidth;
                break;
            case "left":
            default:
                x = startX;
        }
        page.drawText(line, { x, y, size, font, color });
    }
}
/**
 * Draws a multi-font paragraph (e.g. with some bold parts).
 * Supports alignment: left, right, center, justify.
 *
 * @param page The PDF page to draw on.
 * @param parts An array of objects containing the text and the font to use for each part.
 * @param startX The x-coordinate of the starting position.
 * @param startY The y-coordinate of the starting position.
 * @param size The font size to use for drawing the text.
 * @param color The color of the text.
 * @param maxWidth The maximum width of the text before it wraps to a new line.
 * @param lineHeight The height of each line of text.
 * @param align The alignment of the text. One of "left", "right", "center", or "justify".
 *
 * @returns The y-coordinate of the position after the last line of text has been drawn.
 */
function drawMixedParagraph(page, parts, startX, startY, size, color, maxWidth, lineHeight, align = "left") {
    let lines = [[]];
    let currentLineWidth = 0;
    // Proses kata demi kata → pecah ke beberapa baris
    parts.forEach((part) => {
        const words = part.text.split(" ");
        words.forEach((word, idx) => {
            const wordWithSpace = idx < words.length - 1 ? word + " " : word;
            const w = part.font.widthOfTextAtSize(wordWithSpace, size);
            let currentLine = lines[lines.length - 1];
            if (currentLineWidth + w > maxWidth && currentLine.length > 0) {
                // Baris penuh → buat baris baru
                currentLine = [];
                lines.push(currentLine);
                currentLineWidth = 0;
            }
            currentLine.push({ text: wordWithSpace, font: part.font });
            currentLineWidth += w;
        });
    });
    let y = startY;
    // Gambar setiap baris dengan alignment sesuai
    lines.forEach((lineParts, lineIdx) => {
        const lineWidth = lineParts.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.text, size), 0);
        let x;
        if (align === "center") {
            x = startX + (maxWidth - lineWidth) / 2;
        }
        else if (align === "right") {
            x = startX + (maxWidth - lineWidth);
        }
        else if (align === "justify" && lineIdx < lines.length - 1 && lineParts.length > 1) {
            // mode justify (kecuali baris terakhir)
            const totalWordWidth = lineWidth;
            const gapCount = lineParts.length - 1;
            const totalSpace = maxWidth - totalWordWidth;
            const extraSpace = totalSpace / gapCount;
            x = startX;
            lineParts.forEach((part, idx) => {
                page.drawText(part.text, { x, y, size, font: part.font, color });
                x += part.font.widthOfTextAtSize(part.text, size);
                if (idx < lineParts.length - 1) {
                    x += extraSpace;
                }
            });
            y -= lineHeight;
            return;
        }
        else {
            // default: left
            x = startX;
        }
        // Gambar normal (left, center, right, atau justify-last-line)
        lineParts.forEach((part) => {
            page.drawText(part.text, { x, y, size, font: part.font, color });
            x += part.font.widthOfTextAtSize(part.text, size);
        });
        y -= lineHeight;
    });
    return y;
}
/**
 * Loads an image from a file and embeds it into a PDF document.
 * Supports PNG and JPG images.
 *
 * @param pdfDoc The PDF document instance to embed the image into.
 * @param imagePath The absolute or relative path to the image file to load.
 * @param type The type of the image to load. One of "png" or "jpg".
 *
 * @returns A PDFImage instance representing the embedded image,
 *          which can be drawn on a PDF page using `page.drawImage`.
 */
function loadAndEmbedImage(pdfDoc, imagePath, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const absPath = path_1.default.resolve(imagePath);
        if (!fs_1.default.existsSync(absPath)) {
            throw new Error(`Image not found: ${absPath}`);
        }
        const imgBytes = yield fs_1.default.promises.readFile(absPath);
        if (type === "png") {
            return yield pdfDoc.embedPng(imgBytes);
        }
        else {
            return yield pdfDoc.embedJpg(imgBytes);
        }
    });
}
