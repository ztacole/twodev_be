import { Request, Response } from 'express';
import { APL1Service } from './apl-01.service';
import { asyncHandler } from '../../../common/async.handler';

export class APL1Controller {
    static createAssesseeAPL1 = asyncHandler(async (req: Request, res: Response) => {
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
    });

    static createAssesseeCertificate = asyncHandler(async (req: Request, res: Response) => {
        if (!req.body.assessee_id || !req.body.assessor_id) {
            return res.status(400).json({
                success: false,
                message: 'assessee_id dan assessor_id harus diisi'
            });
        }

        const certificate = await APL1Service.createAssesseeCertificate(req.body);

        res.status(201).json({
            success: true,
            message: 'Data sertifikat berhasil disimpan',
            data: certificate
        });
    });

    static uploadCertificateDocs = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = parseInt(req.params.assessorId);
        const assesseeId = parseInt(req.params.assesseeId);
        
        if (isNaN(assessorId) || isNaN(assesseeId)) {
            return res.status(400).json({
                success: false,
                message: 'assessorId atau assesseeId tidak valid'
            });
        }
        
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada file yang diupload'
            });
        }
        
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        
        const result = await APL1Service.uploadCertificateDocs(assessorId, assesseeId, files);
        
        res.status(200).json({
            success: true,
            message: 'Dokumen sertifikat berhasil diupload',
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