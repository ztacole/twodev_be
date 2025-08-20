import { Request, Response } from "express";
import { APL2Service } from "./apl-02.service";
import { asyncHandler } from "../../../common/async.handler";

export class APL2Controller {
    static getAssessments = asyncHandler(async (req: Request, res: Response) => {
        const assessments = await APL2Service.getAssessments();

        res.json({
            success: true,
            message: 'Asesmen berhasil diambil',
            data: assessments,
        });
    })

    static getAssessmentById = asyncHandler(async (req: Request, res: Response) => {
        const assessment = await APL2Service.getAssessmentById(Number(req.params.id));

        res.json({
            success: true,
            message: 'Asesmen berhasil diambil',
            data: assessment,
        });
    })

    static getUnitCompetenciesByAssessmentId = asyncHandler(async (req: Request, res: Response) => {
        const unitCompetencies = await APL2Service.getUnitCompetenciesByAssessmentCode(req.params.assessmentCode);
        
        res.status(200).json({
            success: true,
            message: 'Unit kompetensi berhasil diambil',
            data: unitCompetencies,
        });
    })

    static getElementsByUnitCompetencyId = asyncHandler(async (req: Request, res: Response) => {
        const elements = await APL2Service.getElementsByUnitCompetencyCode(req.params.unitCompetencyCode);
        
        res.status(200).json({
            success: true,
            message: 'Elemen berhasil diambil',
            data: elements,
        });
    })
}