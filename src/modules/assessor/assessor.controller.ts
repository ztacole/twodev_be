import { Request, Response } from 'express';
import { AssessorService } from './assessor.service';
import { asyncHandler } from '../../common/async.handler';

export class AssessorController {
    static createAssessor = asyncHandler(async (req: Request, res: Response) => {
        try {
            const requiredFields = ['user_id', 'scheme_id', 'address', 'phone_no', 'birth_date', 'no_reg_met'];
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        success: false,
                        message: `Field ${field} diperlukan`,
                    });
                }
            }

            const files = Array.isArray(req.files) ? req.files : [];

            const assessor = await AssessorService.createAssessor(req.body);

            if (files.length > 0) {
                const fs = require('fs');
                const path = require('path');
                const newDir = path.join(process.cwd(), 'public/uploads/assessor', `assessor-${assessor.id}`);
                if (fs.existsSync(newDir)) {
                    for (const fileName of fs.readdirSync(newDir)) {
                        const filePath = path.join(newDir, fileName);
                        try {
                            fs.unlinkSync(filePath);
                        } catch { }
                    }
                }

                for (const file of files) {
                    const oldPath = path.join(process.cwd(), 'public/uploads/assessor/default', file.filename);
                    const newPath = path.join(newDir, file.filename);

                    if (!fs.existsSync(newDir)) {
                        fs.mkdirSync(newDir, { recursive: true });
                    }

                    if (fs.existsSync(oldPath)) {
                        fs.renameSync(oldPath, newPath);
                    }
                }

                const detail = await AssessorService.createOrUpdateAssessorDetail({
                    assessorId: assessor.id,
                    bodyData: req.body,
                    files
                });

                res.status(201).json({
                    success: true,
                    message: 'Data assessor dan detail berhasil dibuat',
                    data: {
                        assessor,
                        detail
                    }
                });
            } else {
                res.status(201).json({
                    success: true,
                    message: 'Data assessor berhasil dibuat',
                    data: assessor,
                });
            }
        } catch (error: any) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan dalam membuat assessor',
                error: error.message
            });
        }
    });


    static getAssessors = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
        const result = await AssessorService.getAssessors(page, limit);
        return res.json({
            success: true,
            message: 'Data assessor berhasil diambil',
            data: result.data,
            meta: result.meta,
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

    static getAssessorUsers = asyncHandler(async (req: Request, res: Response) => {
        try {
            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
            const users = await AssessorService.getAssessorUsers(page, limit);

            res.status(200).json({
                success: true,
                message: 'Semua detail assessor berhasil diambil',
                data: users.data,
                meta: users.meta
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