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
}