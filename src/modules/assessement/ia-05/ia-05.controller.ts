import { IA05Service } from "./ia-05.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";
import { SendAssesseeResultRequest, SendAssessorResultRequest } from "./ia-05.type";

export class IA05Controller {
    static getQuestions = asyncHandler(async (req: Request, res: Response) => {
        const scheduleId = Number(req.params.scheduleId);
        if (!scheduleId) {
            return res.status(400).json({ success: false, message: 'Schedule ID is required' });
        }
        const questions = await IA05Service.getQuestions(scheduleId);
        
        res.status(200).json({
            success: true,
            message: 'Pertanyaan berhasil diambil',
            data: questions
        });
    });

    static getAnswerKeys = asyncHandler(async (req: Request, res: Response) => {
        const scheduleId = Number(req.params.scheduleId);
        if (!scheduleId) {
            return res.status(400).json({ success: false, message: 'Schedule ID is required' });
        }
        const answers = await IA05Service.getAnswerKeys(scheduleId);
        
        res.status(200).json({
            success: true,
            message: 'Kunci Jawaban berhasil diambil',
            data: answers
        });
    });

    static getAssesseeAnswers = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const answers = await IA05Service.getAssesseeAnswers(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Jawaban berhasil diambil',
            data: answers
        });
    });

    static sendAssesseeResult = asyncHandler(async (req: Request, res: Response) => {
        const data: SendAssesseeResultRequest = req.body;
        const result = await IA05Service.sendAssesseeResult(data);
        
        res.status(200).json({
            success: true,
            message: 'Jawaban berhasil dikirimkan',
            data: result
        });
    });

    static sendAssessorResult = asyncHandler(async (req: Request, res: Response) => {
        const data: SendAssessorResultRequest = req.body;
        const result = await IA05Service.sendAssessorResult(data);
        
        res.status(200).json({
            success: true,
            message: 'Jawaban berhasil dikirimkan',
            data: result
        });
    });

    static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }

        const result = await IA05Service.approvedByAssessor(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Tanda tangan berhasil dikirimkan',
            data: result
        });
    });

    static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }

        const result = await IA05Service.approvedByAssessee(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Tanda tangan berhasil dikirimkan',
            data: result
        });
    });

    static getResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA05Service.getResultDetails(resultId);
        
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result
        });
    });
}