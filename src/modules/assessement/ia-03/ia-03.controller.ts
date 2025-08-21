import { IA03Service } from "./ia-03.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";

export class IA03Controller {
    static getIA03Groups = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const iaGroups = await IA03Service.getIA03Groups(assessmentId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })
}