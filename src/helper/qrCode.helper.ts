import QRCode from "qrcode";

/**
 * Generates a QR code as a DataURL (base64 string with `data:image/png;base64,` prefix).
 *
 * @param data The data string to encode into the QR code.
 * @param margin The margin (quiet zone) around the QR code. Default is 1.
 *
 * @returns A DataURL string representing the generated QR code image.
 */
export async function generateQrDataURL(data: string, margin: number = 1): Promise<string> {
  return await QRCode.toDataURL(data, { margin });
}

/**
 * Generates a QR code as a pure base64 string (without the `data:image/png;base64,` prefix).
 *
 * @param data The data string to encode into the QR code.
 * @param margin The margin (quiet zone) around the QR code. Default is 1.
 *
 * @returns A base64 string representing the generated QR code image.
 */
export async function generateQrBase64(data: string, margin: number = 1): Promise<string> {
  const dataURL = await generateQrDataURL(data, margin);
  return dataURL.split(",")[1];
}

/**
 * Generates a QR code as a Uint8Array of image bytes.
 *
 * @param data The data string to encode into the QR code.
 * @param margin The margin (quiet zone) around the QR code. Default is 1.
 *
 * @returns A Uint8Array containing the raw PNG image bytes of the QR code.
 */
export async function generateQrBytes(data: string, margin: number = 1): Promise<Uint8Array> {
  const base64 = await generateQrBase64(data, margin);
  return Uint8Array.from(Buffer.from(base64, "base64"));
}
