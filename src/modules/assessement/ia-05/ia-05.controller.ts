import { IA05Service } from "./ia-05.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";

export class IA05Controller {
    static getQuestions = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const questions = await IA05Service.getQuestions(assessmentId);
        
        res.status(200).json({
            success: true,
            message: 'Pertanyaan berhasil diambil',
            data: questions
        });
    });

    static getAnswers = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const answers = await IA05Service.getAnswers(assessmentId);
        
        res.status(200).json({
            success: true,
            message: 'Kunci Jawaban berhasil diambil',
            data: answers
        });
    });

    static getAssesseeAnswers = asyncHandler(async (req: Request, res: Response) => {
        const assesseeId = Number(req.params.assesseeId);
        const answers = await IA05Service.getAssesseeAnswers(assesseeId);
        
        res.status(200).json({
            success: true,
            message: 'Jawaban berhasil diambil',
            data: answers
        });
    });
}