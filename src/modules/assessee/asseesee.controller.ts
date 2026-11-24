import { Request, Response } from 'express';
import { AssesseeService } from './asseessee.service';
import { asyncHandler } from '../../common/async.handler';
import fs from 'fs';
import path from 'path';

export class AssesseeController {
    static createAssessee = asyncHandler(async (req: Request, res: Response) => {
        const requiredFields = [
            'user_id', 'identity_number', 'birth_date', 'birth_location', 'gender',
            'nationality', 'phone_no', 'address', 'educational_qualifications'
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} diperlukan`,
                });
            }
        }

        let signatureUrl: string | undefined = undefined;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        if (files && files.signature && files.signature[0]) {
            signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
        }

        const assesseeData = {
            ...req.body,
            signature: signatureUrl,
        };

        const assessee = await AssesseeService.createAssessee(assesseeData);
        res.status(201).json({
            success: true,
            message: 'Data assessee berhasil dibuat',
            data: assessee,
        });
    });

    static getAssessees = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
        const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
        const occupation_id = req.query.occupation_id ? Number(req.query.occupation_id) : undefined;
        const year = req.query.year ? Number(req.query.year) : undefined;
      
        const result = await AssesseeService.getAssessees(page, limit, keyword, occupation_id, year);
        return res.json({
            success: true,
            message: 'Data assessee berhasil diambil',
            data: result.data,
            meta: result.meta,
        });
    });

    static getAssesseeById = asyncHandler(async (req: Request, res: Response) => {
        const assessee = await AssesseeService.getAssesseeById(Number(req.params.id));
        res.json({
            success: true,
            message: 'Data assessee berhasil diambil',
            data: assessee,
        });
    });

    static updateAssessee = asyncHandler(async (req: Request, res: Response) => {
        let signatureUrl: string | undefined = undefined;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        
        const existingAssessee = await AssesseeService.getAssesseeById(Number(req.params.id));
        
        if (files && files.signature && files.signature[0]) {
            if (existingAssessee?.signature) {
                try {
                    const oldFilePath = path.join(__dirname, '../../../public', existingAssessee.signature);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (err) {
                    console.error('Gagal menghapus signature lama:', err);
                }
            }
            signatureUrl = `uploads/signatures/${files.signature[0].filename}`;
        }

        const assesseeData = {
            ...req.body,
            signature: signatureUrl || existingAssessee?.signature,
        };

        const assessee = await AssesseeService.updateAssessee(Number(req.params.id), assesseeData);
        res.json({
            success: true,
            message: 'Data assessee berhasil diperbarui',
            data: assessee,
        });
    });

    static deleteAssessee = asyncHandler(async (req: Request, res: Response) => {
        await AssesseeService.deleteAssessee(Number(req.params.id));
        res.json({
            success: true,
            message: 'Data assessee berhasil dihapus',
        });
    });

    static exportAssesseesToExcel = asyncHandler(async (req: Request, res: Response) => {
        const { occupation_id, scheme_id, schedule_id, is_competent, year } = req.query; // <- Tambahkan year

        const filters = {
            occupation_id: occupation_id ? Number(occupation_id) : undefined,
            scheme_id: scheme_id ? Number(scheme_id) : undefined,
            schedule_id: schedule_id ? Number(schedule_id) : undefined,
            is_competent: is_competent !== undefined ? is_competent === 'true' || is_competent === '1' : undefined,
            year: year ? Number(year) : undefined, // <- Tambahkan ini
        };

        const buffer = await AssesseeService.exportAssesseesToExcel(filters);

        const yearLabel = filters.year ? `-${filters.year}` : '';
        const filename = `data-asesi${yearLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        res.send(buffer);
    });
}
