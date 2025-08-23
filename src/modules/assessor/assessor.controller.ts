import { Request, Response } from 'express';
import { AssessorService } from './assessor.service';
import { asyncHandler } from '../../common/async.handler';

export class AssessorController {
    static createAssessor = asyncHandler(async (req: Request, res: Response) => {
        const requiredFields = ['user_id', 'full_name', 'scheme_id', 'address', 'phone_no', 'birth_date', 'no_reg_met'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} diperlukan`,
                });
            }
        }

        const assessor = await AssessorService.createAssessor(req.body);

        res.status(201).json({
            success: true,
            message: 'Data assessor berhasil dibuat',
            data: assessor,
        });
    });

    static getAssessors = asyncHandler(async (req: Request, res: Response) => {
        const assessors = await AssessorService.getAssessors();

        res.json({
            success: true,
            message: 'Data assessor berhasil diambil',
            data: assessors,
        });
    });

    static getAssessorById = asyncHandler(async (req: Request, res: Response) => {
        const assessor = await AssessorService.getAssessorById(Number(req.params.id));

        res.json({
            success: true,
            message: 'Data assessor berhasil diambil',
            data: assessor,
        });
    });

    static getAssessorByUserId = asyncHandler(async (req: Request, res: Response) => {
        const assessor = await AssessorService.getAssessorByUserId(Number(req.params.userId));

        res.json({
            success: true,
            message: 'Data assessor berhasil diambil',
            data: assessor,
        });
    });

    static updateAssessor = asyncHandler(async (req: Request, res: Response) => {
        const assessor = await AssessorService.updateAssessor(Number(req.params.id), req.body);

        res.json({
            success: true,
            message: 'Data assessor berhasil diubah',
            data: assessor,
        });
    });

    static deleteAssessor = asyncHandler(async (req: Request, res: Response) => {
        await AssessorService.deleteAssessor(Number(req.params.id));

        res.json({
            success: true,
            message: 'Data assessor berhasil dihapus',
        });
    });
}