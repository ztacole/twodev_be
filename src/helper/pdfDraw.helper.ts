import { PDFPage, PDFFont, RGB, rgb, PDFDocument, PDFImage, } from "pdf-lib";
import fs from 'fs';
import path from 'path';

// text alignment
type TextAlign = 'left' | 'center' | 'right' | 'justify';

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
 * @param underline If true, the text will be underlined.
 *
 * @returns The y-coordinate of the position after the last line of text has been drawn.
 */
export function drawParagraph(
  page: PDFPage,
  text: string,
  startX: number,
  startY: number,
  font: PDFFont,
  size: number,
  align: TextAlign = "left",
  color: RGB = rgb(0, 0, 0),
  maxWidth?: number,
  lineHeight: number = size + 4,
  underline: boolean = false
): number {
  const { width } = page.getSize();
  const usableWidth = maxWidth ?? width - startX * 2;

  const words = text.split(" ");
  let line = "";
  let y = startY;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const testWidth =
      font.widthOfTextAtSize(testLine + " ", size) +
      font.widthOfTextAtSize(" ", size);

    // Jika panjang kalimat melebihi lebar halaman → turun baris
    if (testWidth > usableWidth && line) {
      drawLine(page, line, startX, y, font, size, align, color, usableWidth, width);

      if (underline) {
        const textWidth = font.widthOfTextAtSize(line, size);
        let underlineX = startX;
      
        if (align === "center") {
          underlineX = startX + (usableWidth - textWidth) / 2;
        } else if (align === "right") {
          underlineX = startX + (usableWidth - textWidth);
        }
      
        const underlineY = y - 2;
        page.drawLine({
          start: { x: underlineX, y: underlineY },
          end: { x: underlineX + textWidth, y: underlineY },
          thickness: 0.5,
          color,
        });
      }

      y -= lineHeight;
      line = words[i] ?? "";
    } else {
      line = testLine ?? "";
    }
  }

  if (line) {
    const effectiveAlign = align === "justify" ? "left" : align;
  
    drawLine(
      page,
      line,
      startX,
      y,
      font,
      size,
      effectiveAlign,
      color,
      usableWidth,
      width
    );
  
    if (underline) {
      const textWidth = font.widthOfTextAtSize(line, size);
      let underlineX = startX;
  
      if (effectiveAlign === "center") {
        underlineX = startX + (usableWidth - textWidth) / 2;
      } else if (effectiveAlign === "right") {
        underlineX = startX + (usableWidth - textWidth);
      }
  
      const underlineY = y - 2;
      page.drawLine({
        start: { x: underlineX, y: underlineY },
        end: { x: underlineX + textWidth, y: underlineY },
        thickness: 1,
        color,
      });
    }
  
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
function drawLine(
  page: PDFPage,
  line: string,
  startX: number,
  y: number,
  font: PDFFont,
  size: number,
  align: TextAlign,
  color: RGB,
  usableWidth: number,
  pageWidth: number
) {
  const words = line.split(" ");
  const lineWidth = font.widthOfTextAtSize(line, size);

  if (align === "justify" && words.length > 1) {
    // Mode justify: distribusikan spasi ekstra antar kata
    const spaceCount = words.length - 1;
    const totalSpaceWidth =
      usableWidth - (lineWidth - font.widthOfTextAtSize(" ", size) * spaceCount);
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
  } else {
    // Mode left, center, right
    let x: number;
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
export function drawMixedParagraph(
  page: PDFPage,
  parts: { text: string; font: PDFFont }[],
  startX: number,
  startY: number,
  size: number,
  color: RGB,
  maxWidth: number,
  lineHeight: number,
  align: TextAlign = "left"
): number {
  let lines: { text: string; font: PDFFont }[][] = [[]];
  let currentLineWidth = 0;

  // Proses kata demi kata → pecah ke beberapa baris
  parts.forEach((part) => {
    const words = part.text.split(" ");
    words.forEach((word, idx) => {
      const wordWithSpace = idx < words.length - 1 ? word + " " : word;
      const w = part.font.widthOfTextAtSize(wordWithSpace, size);

      let currentLine = lines[lines.length - 1]!;
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
    const lineWidth = lineParts.reduce(
      (sum, part) => sum + part.font.widthOfTextAtSize(part.text, size),
      0
    );

    let x: number;

    if (align === "center") {
      x = startX + (maxWidth - lineWidth) / 2;
    } else if (align === "right") {
      x = startX + (maxWidth - lineWidth);
    } else if (align === "justify" && lineIdx < lines.length - 1 && lineParts.length > 1) {
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
    } else {
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
export async function loadAndEmbedImage(
  pdfDoc: PDFDocument,
  imagePath: string,
  type: "png" | "jpg"
): Promise<PDFImage> {
  const absPath = path.resolve(imagePath);

  if (!fs.existsSync(absPath)) {
    throw new Error(`Image not found: ${absPath}`);
  }

  const imgBytes = await fs.promises.readFile(absPath);

  if (type === "png") {
    return await pdfDoc.embedPng(imgBytes);
  } else {
    return await pdfDoc.embedJpg(imgBytes);
  }
}

/**
 * Draws a form field with a label and value.
 * The label is drawn on the left side of the field,
 * and the value is drawn on the right side.
 * The value can be a single line of text or a multi-line block of text.
 * The text is drawn with the provided font and size.
 * The height of each line of text is calculated as the font size plus 4.
 * The x-coordinate of the starting position is used to draw the label and value.
 * The y-coordinate of the starting position is used to draw the first line of text.
 * The function returns the y-coordinate of the position after the last line of text has been drawn.
 *
 * @param page The PDF page to draw the field on.
 * @param label The label of the field.
 * @param value The value of the field.
 * @param startX The x-coordinate of the starting position.
 * @param y The y-coordinate of the starting position.
 * @param font The font to use for drawing the text.
 * @param size The size of the font.
 * @param labelWidth The width of the label in pixels. Defaults to 110.
 * @param gap The gap between the label and value in pixels. Defaults to 8.
 * @param lineHeight The height of each line of text in pixels. Defaults to the font size plus 4.
 * @returns The y-coordinate of the position after the last line of text has been drawn.
 */
export function drawField(
  page: PDFPage,
  label: string,
  value: string,
  startX: number,
  y: number,
  font: PDFFont,
  size: number,
  labelWidth: number = 110,
  gap: number = 8,
  lineHeight: number = size + 4
): number {
  page.drawText(label, {
    x: startX,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  });

  const colonX = startX + labelWidth + 2;
  page.drawText(":", {
    x: colonX,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  });

  const valueX = colonX + gap;
  const lines = value.split("\n");

  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: valueX,
      y: y - (idx * lineHeight),
      size,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return y - (lines.length * lineHeight);
}

