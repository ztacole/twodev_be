import { IA03Service } from "./ia-03.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";
import { SendResultRequest } from "./ia-03.type";

export class IA03Controller {
    static getIA03Groups = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const iaGroups = await IA03Service.getIA03Groups(resultId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static sendResult = asyncHandler(async (req: Request, res: Response) => {
        const data: SendResultRequest = req.body;
        const result = await IA03Service.sendResult(data);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil dikirimkan',
            data: result
        });
    })

    static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA03Service.approvedByAssessor(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil disetujui',
            data: result
        });
    })

    static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA03Service.approvedByAssessee(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil disetujui',
            data: result
        });
    })

    static getResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA03Service.getResultDetails(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result
        });
    })
}