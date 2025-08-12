import { Request, Response } from "express";
import { APL2Service } from "./apl2.service";
import { asyncHandler } from "../../../common/async.handler";

export class APL2Controller {
    static createAssessment = asyncHandler(async (req: Request, res: Response) => {
        // Validate data
        if (!req.body.occupation_id || !req.body.code || !req.body.unit_competencies || !req.body.unit_competencies.length) {
            return res.status(400).json({
                success: false,
                message: 'Data asesmen tidak lengkap',
            });
        }

        req.body.unit_competencies.forEach((unitCompetency: any) => {
            if (!unitCompetency.unit_code || !unitCompetency.title || !unitCompetency.elements || !unitCompetency.elements.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Data unit kompetensi tidak lengkap',
                });
            }

            unitCompetency.elements.forEach((element: any) => {
                if (!element.title || !element.element_details || !element.element_details.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data elemen tidak lengkap',
                    });
                }

                element.element_details.forEach((detail: any) => {
                    if (!detail.description) {
                        return res.status(400).json({
                            success: false,
                            message: 'Data indikator tidak lengkap',
                        });
                    }
                });
            });
        })

        // Create assessment
        const assessment = await APL2Service.createAssessment(req.body);
        res.status(201).json({
            success: true,
            message: 'Asesmen berhasil dibuat',
            data: assessment,
        });
    })

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