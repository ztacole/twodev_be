import { Request, Response } from "express";
import { APL02Service } from "./apl-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { GenerateAsssessorRequest, ResultHeaderRequest } from "./apl-02.type";

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
        const resultId = Number(req.params.resultId);
        const result = await APL02Service.getUnitsResult(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result,
        });
    })

    static getElementsResult = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        const unitId = Number(req.params.unitId);
        const result = await APL02Service.getElementsResult(resultId, unitId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result,
        });
    })

    static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        const data: GenerateAsssessorRequest = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Data harus diisi',
            });
        }

        const result = await APL02Service.approvedByAssessor(resultId, data);
        
        res.status(200).json({
            success: true,
            message: 'Assessor telah tanda tangan!',
            data: result,
        });
    })
}