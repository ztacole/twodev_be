import { ResultPdfService } from "./result-pdf.service";
import { Request, Response } from "express";
import { asyncHandler } from "../../../common/async.handler";

export class ResultPdfController {
    static generateApl02 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        const { pdfBytes, assesseeName } = await ResultPdfService.generateApl02(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-APL-02.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateIA01 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const { pdfBytes, assesseeName } = await ResultPdfService.generateIA01(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-IA-01.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateAPL01 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateAPL01(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-APL-01.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    });
    
    static generateAK01 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateAK01(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-AK-01.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })
    
    static generateAK02 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateAK02(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-AK-02.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateIA03 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateIA03(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-IA-03.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateIA05 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateIA05(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-IA-05.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateAK03 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateAK03(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-AK-03.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateAK05 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const {pdfBytes, assesseeName} = await ResultPdfService.generateAK05(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${assesseeName}-AK-05.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    })
}