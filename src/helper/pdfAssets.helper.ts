// qrCode.helper.ts
import { PDFDocument, PDFImage } from "pdf-lib";
import { generateQrBytes } from "./qrCode.helper";

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
