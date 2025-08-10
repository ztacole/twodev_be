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
                message: 'Asesmen berhasil dibuat',
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

            if (!assessments || assessments.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada asesmen yang ditemukan',
                });
            }

            res.json({
                success: true,
                message: 'Asesmen berhasil diambil',
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
                    message: `Asesmen dengan ID ${req.params.id} tidak ditemukan`,
                });
            }
            res.json({
                success: true,
                message: 'Asesmen berhasil diambil',
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
                    message: 'Tidak ada unit kompetensi yang ditemukan',
                });
            }
            res.status(200).json({
                success: true,
                message: 'Unit kompetensi berhasil diambil',
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
                    message: 'Tidak ada elemen yang ditemukan',
                });
            }
            res.status(200).json({
                success: true,
                message: 'Elemen berhasil diambil',
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