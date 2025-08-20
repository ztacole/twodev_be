import { Request, Response } from 'express';
import { APL1Service } from './apl1.service';
import { asyncHandler } from '../../../common/async.handler';

export class Apl1Controller {
    private apl1Service: APL1Service;

    constructor() {
        this.apl1Service = new APL1Service();
    }

    createAssesseeAPL1 = asyncHandler(async (req: Request, res: Response) => {
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

        const assessee = await this.apl1Service.createOrUpdateAssessee(req.body);

        res.status(201).json({
            success: true,
            message: 'Data assessee berhasil disimpan',
            data: assessee
        });
    });

    createAssesseeCertificate = asyncHandler(async (req: Request, res: Response) => {
        if (!req.body.assessee_id || !req.body.assessor_id) {
            return res.status(400).json({
                success: false,
                message: 'assessee_id dan assessor_id harus diisi'
            });
        }

        const certificate = await this.apl1Service.createAssesseeCertificate(req.body);

        res.status(201).json({
            success: true,
            message: 'Data sertifikat berhasil disimpan',
            data: certificate
        });
    });

    uploadCertificateDocs = asyncHandler(async (req: Request, res: Response) => {
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
        
        const result = await this.apl1Service.uploadCertificateDocs(assessorId, assesseeId, files);
        
        res.status(200).json({
            success: true,
            message: 'Dokumen sertifikat berhasil diupload',
            data: result
        });
    });
}
