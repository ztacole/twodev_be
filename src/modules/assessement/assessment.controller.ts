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
}