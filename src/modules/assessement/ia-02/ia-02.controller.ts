import { IAO2Service } from "./ia-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";

export class IA02Controller {
    static getIA02Groups = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        if (!assessmentId) {
            return res.status(400).json({ success: false, message: 'Assessment ID is required' });
        }
        const iaGroups = await IAO2Service.getIA02Groups(assessmentId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const iaGroups = await IAO2Service.approveByAssessor(resultId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const iaGroups = await IAO2Service.approveByAssessee(resultId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static getResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IAO2Service.getResultDetails(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result
        });
    })
}