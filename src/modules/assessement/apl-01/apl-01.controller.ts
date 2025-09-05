import { Request, Response } from 'express';
import { APL1Service } from './apl-01.service';
import { asyncHandler } from '../../../common/async.handler';

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
        const assessmentId = parseInt(req.body.assessment_id);

        if (isNaN(assesseeId) || isNaN(assessorId) || isNaN(assessmentId)) {
            return res.status(400).json({
                success: false,
                message: 'assessee_id, assessor_id, assessment_id harus valid'
            });
        }

        const files = Array.isArray(req.files) ? req.files : [];

        const result = await APL1Service.createOrUploadCertificate({
            assessee_id: assesseeId,
            assessor_id: assessorId,
            assessment_id: assessmentId,
            bodyData: req.body,
            files
        });

        res.status(201).json({
            success: true,
            message: 'Data sertifikat dan file berhasil disimpan',
            data: result
        });
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
        const resultId = parseInt(req.params.resultId);
        const result = await APL1Service.approveResultDoc(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil disetujui',
            data: result
        });
    });
}