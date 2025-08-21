import { IAO2Service } from "./ia-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";

export class IA02Controller {
    static getIA02Groups = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const iaGroups = await IAO2Service.getIA02Groups(assessmentId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })
}