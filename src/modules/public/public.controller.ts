import { PublicService } from "./public.service";
import { Request, Response } from "express";

export class PublicController {
    public static async getAssesseeById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID asesi diperlukan'
            });
        }

        const assessee = await PublicService.getAssesseeById(id);
        res.status(200).json({
            success: true,
            message: 'Data asesi berhasil diambil',
            data: assessee
        });
    }

    public static async getAssessorById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID asesor diperlukan'
            });
        }

        const assessor = await PublicService.getAssessorById(id);
        res.status(200).json({
            success: true,
            message: 'Data asesor berhasil diambil',
            data: assessor
        });
    }
}