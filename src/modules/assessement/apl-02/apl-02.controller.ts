import { Request, Response } from "express";
import { APL02Service } from "./apl-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { ResultHeaderRequest } from "./apl-02.type";

export class APL02Controller {
    static getUnitsAPL02 = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const unitCompetencies = await APL02Service.getUnitsAPL02(assessmentId);
        
        res.status(200).json({
            success: true,
            message: 'Unit kompetensi berhasil diambil',
            data: unitCompetencies,
        });
    })

    static getElementsByUnitId = asyncHandler(async (req: Request, res: Response) => {
        const unitId = Number(req.params.unitId);
        const elements = await APL02Service.getElementsByUnitId(unitId);
        
        res.status(200).json({
            success: true,
            message: 'Elemen berhasil diambil',
            data: elements,
        });
    })

    static sendResult = asyncHandler(async (req: Request, res: Response) => {
        const data: ResultHeaderRequest = req.body;
        const result = await APL02Service.sendResult(data);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil dikirimkan',
            data: result,
        });
    })

    static getUnitsResult = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const assesseeId = Number(req.params.assesseeId);
        const assessmentId = Number(req.params.assessmentId);
        const result = await APL02Service.getUnitsResult(assessorId, assesseeId, assessmentId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result,
        });
    })

    static getElementsResult = asyncHandler(async (req: Request, res: Response) => {
        const assesseeId = Number(req.params.assesseeId);
        const unitId = Number(req.params.unitId);
        const assessorId = Number(req.params.assessorId);
        const result = await APL02Service.getElementsResult(assessorId, assesseeId, unitId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result,
        });
    })
}