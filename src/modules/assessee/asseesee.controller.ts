import { Request, Response } from 'express';
import { AssesseeService } from './asseessee.service';
import { asyncHandler } from '../../common/async.handler';

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

        const assessee = await AssesseeService.createAssessee(req.body);
        res.status(201).json({
            success: true,
            message: 'Data assessee berhasil dibuat',
            data: assessee,
        });
    });

    static getAssessees = asyncHandler(async (req: Request, res: Response) => {
        const hasPagingParams = typeof (req.params as any)?.page !== 'undefined' && typeof (req.params as any)?.limit !== 'undefined';
        const hasPagingQuery = typeof req.query.page !== 'undefined' || typeof req.query.limit !== 'undefined';

        if (hasPagingParams || hasPagingQuery) {
            const page = Math.max(1, Number((req.params as any).page ?? req.query.page) || 1);
            const limit = Math.max(1, Math.min(100, Number((req.params as any).limit ?? req.query.limit) || 10));
            const result = await AssesseeService.getAssessees(page, limit);
            return res.json({
                success: true,
                message: 'Data assessee berhasil diambil',
                data: result.data,
                meta: result.meta,
            });
        }

        const data = await AssesseeService.getAllAssessees();
        res.json({
            success: true,
            message: 'Data assessee berhasil diambil',
            data
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
        const assessee = await AssesseeService.updateAssessee(Number(req.params.id), req.body);
        res.json({
            success: true,
            message: 'Data assessee berhasil diubah',
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
}

