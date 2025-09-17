import { Request, Response } from 'express';
import { AssessorService } from './assessor.service';
import { asyncHandler } from '../../common/async.handler';

export class AssessorController {
    static createAssessor = asyncHandler(async (req: Request, res: Response) => {
        const requiredFields = ['user_id', 'scheme_id', 'address', 'phone_no', 'birth_date', 'no_reg_met'];
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

    static createOrUpdateAssessorDetail = asyncHandler(async (req: Request, res: Response) => {
        try {
            const assessorId = parseInt(req.body.assessor_id || req.body.assessorId);
            
            if (isNaN(assessorId)) {
                return res.status(400).json({
                    success: false,
                    message: 'assessor_id harus valid'
                });
            }

            const files = Array.isArray(req.files) ? req.files : [];

            const result = await AssessorService.createOrUpdateAssessorDetail({
                assessorId,
                bodyData: req.body,
                files
            });

            res.status(201).json({
                success: true,
                message: 'Data detail assessor berhasil disimpan',
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan dalam menyimpan detail assessor',
                error: error.message
            });
        }
    });

    static getAssessorDetail = asyncHandler(async (req: Request, res: Response) => {
        try {
            const assessorId = parseInt(req.params.assessorId);
            
            if (isNaN(assessorId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Assessor ID harus valid'
                });
            }

            const result = await AssessorService.getAssessorDetail(assessorId);

            res.status(200).json({
                success: true,
                message: 'Detail assessor berhasil diambil',
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan dalam mengambil detail assessor',
                error: error.message
            });
        }
    });

    static getAllAssessorDetails = asyncHandler(async (req: Request, res: Response) => {
        try {
            const results = await AssessorService.getAllAssessorDetails();

            res.status(200).json({
                success: true,
                message: 'Semua detail assessor berhasil diambil',
                data: results
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan dalam mengambil detail assessor',
                error: error.message
            });
        }
    });
}