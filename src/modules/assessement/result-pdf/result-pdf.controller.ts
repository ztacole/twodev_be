import { ResultPdfService } from "./result-pdf.service";
import { Request, Response } from "express";
import { asyncHandler } from "../../../common/async.handler";

export class ResultPdfController {
    static generateIA01 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const pdfBytes = await ResultPdfService.generateIA01(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=\"IA-01.pdf\""
        );
        res.send(Buffer.from(pdfBytes));
    })

    static generateAPL01 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const pdfBytes = await ResultPdfService.generateAPL01(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=\"APL-01.pdf\""
        );
        res.send(Buffer.from(pdfBytes));
    });
    
    static generateAK02 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);

        const pdfBytes = await ResultPdfService.generateAK02(resultId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=\"AK-02.pdf\""
        );
        res.send(Buffer.from(pdfBytes));
    })
}