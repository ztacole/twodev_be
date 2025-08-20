import { Request, Response } from "express";
import { APL02Service } from "./apl-02.service";
import { asyncHandler } from "../../../common/async.handler";

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
}