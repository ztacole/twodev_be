import { AssessmentService } from "./assessment.service";
import { asyncHandler } from "../../common/async.handler";
import { Request, Response } from "express";
import { AssessmentRequest } from "./assessment.type";
import { JwtPayload } from "jsonwebtoken";

export class AssessmentController {
    static createAssessment = asyncHandler(async (req: Request, res: Response) => {
        const data: AssessmentRequest = req.body;
        const result = await AssessmentService.createAssessment(data);
        res.status(201).json({
            success: true,
            message: "Assessment berhasil dibuat",
            data: result,
        });
    });

    static getAssessments = asyncHandler(async (req: Request, res: Response) => {
        const result = await AssessmentService.getAssessments();
        res.status(200).json({
            success: true,
            message: "Assessment berhasil diambil",
            data: result,
        });
    });

    static deleteAssessment = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID assessment harus diisi",
            });
        }
        const result = await AssessmentService.deleteAssessment(id);
        res.status(200).json({
            success: true,
            message: "Assessment berhasil dihapus",
        });
    });

    static getAssessmentById = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID assessment harus diisi",
            });
        }
        const result = await AssessmentService.getAssessmentById(id);
        res.status(200).json({
            success: true,
            message: "Assessment berhasil diambil",
            data: result,
        });
    });

    static getAssessmentResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const assessorId = Number(req.params.assessorId);
        let assesseeId = Number(req.params.assesseeId);
        if (!assessmentId || !assessorId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID, Assessor ID, dan Assessee ID harus diisi",
            });
        }
        if (!assesseeId) {
            const user = req.user as JwtPayload;
            assesseeId = await AssessmentService.findAssesseeByUserId(assessmentId, assessorId, user.id);

            if (assesseeId === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Assessee tidak ditemukan untuk user ini",
                });
            }
        }
        
        const result = await AssessmentService.getAssessmentResultDetails(assessmentId, assessorId, assesseeId);
        res.status(200).json({
            success: true,
            message: "Detail hasil assessment berhasil diambil",
            data: result,
        });
    });

    static getNavigationAssessee = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const assessorId = Number(req.params.assessorId);
        const assesseeId = Number(req.params.assesseeId);
        if (!assessmentId || !assessorId || !assesseeId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID, Assessor ID, dan Assessee ID harus diisi",
            });
        }

        const result = await AssessmentService.assesseeNavigation(assessmentId, assessorId, assesseeId);
        res.status(200).json({
            success: true,
            message: "Navigasi berhasil diambil",
            data: result,
        });
    });

    static getNavigationAssessor = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID harus diisi",
            });
        }

        const result = await AssessmentService.assessorNavigation(assessmentId);
        res.status(200).json({
            success: true,
            message: "Navigasi berhasil diambil",
            data: result,
        });
    });
}