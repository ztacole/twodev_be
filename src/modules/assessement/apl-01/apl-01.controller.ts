import { Request, Response } from 'express';
import { APL1Service } from './apl-01.service';
import { asyncHandler } from '../../../common/async.handler';
import { JwtPayload } from 'jsonwebtoken';

export class APL1Controller {
    static createAssesseeAPL1 = asyncHandler(async (req: Request, res: Response) => {
        try {
            const requiredFields = [
                'user_id', 'full_name', 'identity_number', 'birth_date',
                'birth_location', 'gender', 'nationality', 'phone_no',
                'address', 'postal_code', 'educational_qualifications'
            ];

            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        success: false,
                        message: `Field ${field} harus diisi`
                    });
                }
            }

            const assessee = await APL1Service.createOrUpdateAssessee(req.body);

            res.status(201).json({
                success: true,
                message: 'Data assessee berhasil disimpan',
                data: assessee
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan dalam membuat assessee',
                error: error.message
            });
        }
    });

    static createOrUploadCertificateDocs = asyncHandler(async (req: Request, res: Response) => {
        const assesseeId = parseInt(req.body.assessee_id);
        const assessorId = parseInt(req.body.assessor_id);
        const scheduleId = parseInt(req.body.schedule_id);

        if (isNaN(assesseeId) || isNaN(assessorId) || isNaN(scheduleId)) {
            return res.status(400).json({
                success: false,
                message: 'assessee_id, assessor_id, schedule_id harus valid'
            });
        }

        const files = Array.isArray(req.files) ? req.files : [];

        if (files.length < 5) {
            return res.status(400).json({
                success: false,
                message: 'File belum lengkap. Pastikan semua file yang diperlukan diunggah.'
            });
        }

        try {
            const result = await APL1Service.createOrUploadCertificate({
                assessee_id: assesseeId,
                assessor_id: assessorId,
                schedule_id: scheduleId,
                bodyData: req.body,
                files
            });
    
            res.status(201).json({
                success: true,
                message: 'Data sertifikat dan file berhasil disimpan',
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan dalam membuat sertifikat',
                error: error.message
            });
        }
    });

    static getAllResult = asyncHandler(async (req: Request, res: Response) => {
        const results = await APL1Service.getAllResultDoc();
        res.status(200).json({
            success: true,
            message: 'Semua hasil berhasil diambil',
            data: results
        });
    });

    static getResultDocsByAssessmentId = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        const results = await APL1Service.getResultDocsByAssessmentId(assessmentId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: results
        });
    })

    static getResultDocsByAssessorId = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const results = await APL1Service.getResultDocsByAssessorId(assessorId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: results
        });
    })

    static getUnapprovedResult = asyncHandler(async (req: Request, res: Response) => {
        const results = await APL1Service.getUnapprovedResultDoc();
        res.status(200).json({
            success: true,
            message: 'Semua hasil yang belum disetujui berhasil diambil',
            data: results
        });
    });

    static approveResult = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;
        const resultId = parseInt(req.params.resultId);
        const result = await APL1Service.approveResultDoc(resultId, user.id);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil disetujui',
            data: result
        });
    });

    static getResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = parseInt(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await APL1Service.getResultDetails(resultId);
        res.status(200).json({
            success: true,
            message: 'Detail hasil berhasil diambil',
            data: result
        });
    });

    static getResultDocsByResultId = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const results = await APL1Service.getResultDocsByResultId(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: results
        });
    });
}