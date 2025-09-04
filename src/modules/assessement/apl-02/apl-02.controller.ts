import { Request, Response } from "express";
import { APL02Service } from "./apl-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { GenerateAsssessorRequest, ElementRequest, ResultRequest } from "./apl-02.type";

export class APL02Controller {
    static getUnitsAPL02 = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            throw new Error('Result ID is required');
        }

        const unitCompetencies = await APL02Service.getUnitsAPL02(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Unit kompetensi berhasil diambil',
            data: unitCompetencies,
        });
    })

    static getElementsByUnitId = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        const unitId = Number(req.params.unitId);
        if (!resultId || !unitId) {
            throw new Error('Result ID and Unit ID are required');
        }
        const elements = await APL02Service.getElementsByUnitId(resultId, unitId);
        
        res.status(200).json({
            success: true,
            message: 'Elemen berhasil diambil',
            data: elements,
        });
    })

    static sendResult = asyncHandler(async (req: Request, res: Response) => {
        const data: ElementRequest = req.body;
        const result = await APL02Service.sendResult(data);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil dikirimkan',
            data: result,
        });
    })

    static sendResultHeader = asyncHandler(async (req: Request, res: Response) => {
        const data: ResultRequest = req.body;
        const result = await APL02Service.sendResultHeader(data);
        
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
        if (!resultId || !unitId) {
            throw new Error('Result ID and Unit ID are required');
        }

        const result = await APL02Service.getElementsResult(resultId, unitId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result,
        });
    })

    static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({
                success: false,
                message: 'Result ID is required',
            });
        }

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

    static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({
                success: false,
                message: 'Result ID is required',
            });
        }

        const result = await APL02Service.approvedByAssessee(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Assessee telah tanda tangan!',
            data: result,
        });
    })

    static getResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({
                success: false,
                message: 'Result ID is required',
            });
        }

        const result = await APL02Service.getResultDetails(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result,
        });
    })
}