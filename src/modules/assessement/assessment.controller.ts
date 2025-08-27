import { AssessmentService } from "./assessment.service";
import { asyncHandler } from "../../common/async.handler";
import { Request, Response } from "express";
import { AssessmentRequest } from "./assessment.type";

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
            throw new Error("ID is required");
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
            throw new Error("ID is required");
        }
        const result = await AssessmentService.getAssessmentById(id);
        res.status(200).json({
            success: true,
            message: "Assessment berhasil diambil",
            data: result,
        });
    });

    static getAssessmentResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            throw new Error("Result ID is required");
        }
        const result = await AssessmentService.getAssessmentResultDetails(resultId);
        res.status(200).json({
            success: true,
            message: "Detail hasil assessment berhasil diambil",
            data: result,
        });
    });
}