// qrCode.helper.ts
import path from "path";
import { PDFDocument, rgb, PDFPage, PDFImage } from "pdf-lib";
import { generateQrBytes } from "./qrCode.helper";
import { loadAndEmbedImage } from "./pdfDraw.helper";

/**
 * Embeds a QR code into a PDF document as a PNG image.
 *
 * @param pdfDoc The PDF document instance to embed the QR code into.
 * @param data The data string to encode into the QR code.
 *
 * @returns A PDFImage instance representing the embedded QR code,
 *          which can be drawn on a PDF page using `page.drawImage`.
 */
export async function embedQrCode(
  pdfDoc: PDFDocument,
  data: string
): Promise<PDFImage> {
  const qrImageBytes = await generateQrBytes(data);
  return await pdfDoc.embedPng(qrImageBytes);
}

export async function kopSurat(
  pdfDoc: PDFDocument,
  page: PDFPage,
  options?: {
    imagePath?: string;
    type?: "png" | "jpg";
    marginX?: number;
    marginTop?: number;
    height?: number;
  }
): Promise<number> {
  const {
    imagePath = path.join(__dirname, "../../public/images/kop-surat.png"),
    type = "png",
    marginX = 40,
    marginTop = 100,
    height = 80,
  } = options || {};

  const { width: pageWidth, height: pageHeight } = page.getSize();

  const icon = await loadAndEmbedImage(pdfDoc, imagePath, type);

  const startY = pageHeight - marginTop;

  page.drawImage(icon, {
    x: marginX,
    y: startY,
    width: pageWidth - marginX * 2,
    height,
  });

  let yK = startY - 6;

  page.drawLine({
    start: { x: marginX, y: yK },
    end: { x: pageWidth - marginX, y: yK },
    thickness: 2,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: marginX, y: yK - 2 },
    end: { x: pageWidth - marginX, y: yK - 2 },
    thickness: 0,
    color: rgb(0, 0, 0),
  });

  return yK - 20;
}