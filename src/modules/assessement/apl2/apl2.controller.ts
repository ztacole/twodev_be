import { Request, Response } from "express";
import { APL2Service } from "./apl2.service";

export class APL2Controller {
    private apl2Service: APL2Service;

    constructor() {
        this.apl2Service = new APL2Service();
    }

    async createAssessment(req: Request, res: Response) {
        try {
            const assessment = await this.apl2Service.createAssessment(req.body);
            res.status(201).json({
                success: true,
                message: 'Assessment created successfully',
                data: assessment,
            });
        } catch (error : any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getAssessments(req: Request, res: Response) {
        try {
            const assessments = await this.apl2Service.getAssessments();
            res.json({
                success: true,
                message: 'Assessments retrieved successfully',
                data: assessments,
            });
        } catch (error : any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getAssessmentById(req: Request, res: Response) {
        try {
            const assessment = await this.apl2Service.getAssessmentById(Number(req.params.id));
            if (!assessment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assessment not found',
                });
            }
            res.json({
                success: true,
                message: 'Assessment retrieved successfully',
                data: assessment,
            });
        } catch (error : any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getUnitCompetenciesByAssessmentId(req: Request, res: Response) {
        try {
            const unitCompetencies = await this.apl2Service.getUnitCompetenciesByAssessmentId(Number(req.params.assessmentId));
            if (!unitCompetencies) {
                return res.status(404).json({
                    success: false,
                    message: 'Unit competencies not found',
                });
            }
            res.status(200).json({
                success: true,
                message: 'Unit competencies retrieved successfully',
                data: unitCompetencies,
            });
        } catch (error : any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getElementsByUnitCompetencyId(req: Request, res: Response) {
        try {
            const elements = await this.apl2Service.getElementsByUnitCompetencyId(Number(req.params.unitCompetencyId));
            if (!elements) {
                return res.status(404).json({
                    success: false,
                    message: 'Elements not found',
                });
            }
            res.status(200).json({
                success: true,
                message: 'Elements retrieved successfully',
                data: elements,
            });
        } catch (error : any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}