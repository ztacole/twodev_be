import { Request, Response } from 'express';
import { AssesseeService } from './assessee.service';
import { asyncHandler } from '../../common/async.handler';

export class AssesseeController {
    static createAssesse = asyncHandler(async (req: Request, res: Response) => {
        const requiredFields = [
            'user_id', 'full_name', 'identity_number', 'birth_date', 
            'birth_location', 'gender', 'nationality', 'phone_no', 
            'address', 'educational_qualifications'
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} is required`,
                });
            }
        }

        if (req.body.jobs && Array.isArray(req.body.jobs)) {
            for (const job of req.body.jobs) {
                const jobRequiredFields = ['institution_name', 'address', 'position', 'phone_no'];
                for (const field of jobRequiredFields) {
                    if (!job[field]) {
                        return res.status(400).json({
                            success: false,
                            message: `Job field ${field} diperlukan`,
                        });
                    }
                }
            }
        }

        const assesse = await AssesseeService.createAssesse(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Data asesi berhasil dibuat',
            data: assesse,
        });
    });

    static getAssesses = asyncHandler(async (req: Request, res: Response) => {
        const assesses = await AssesseeService.getAssesses();
        
        res.json({
            success: true,
            message: 'Data asesi berhasil diambil',
            data: assesses,
        });
    });

    static getAssesseById = asyncHandler(async (req: Request, res: Response) => {
        const assesse = await AssesseeService.getAssesseById(Number(req.params.id));
        
        res.json({
            success: true,
            message: 'Data asesi berhasil diambil',
            data: assesse,
        });
    });

    static getAssesseByUserId = asyncHandler(async (req: Request, res: Response) => {
        const assesse = await AssesseeService.getAssesseByUserId(Number(req.params.userId));
        
        res.json({
            success: true,
            message: 'Data asesi berhasil diambil',
            data: assesse,
        });
    });

    static updateAssesse = asyncHandler(async (req: Request, res: Response) => {
        if (req.body.jobs && Array.isArray(req.body.jobs)) {
            for (const job of req.body.jobs) {
                const jobRequiredFields = ['institution_name', 'address', 'position', 'phone_no'];
                for (const field of jobRequiredFields) {
                    if (!job[field]) {
                        return res.status(400).json({
                            success: false,
                            message: `Job field ${field} diperlukan`,
                        });
                    }
                }
            }
        }

        const assesse = await AssesseeService.updateAssesse(
            Number(req.params.id),
            req.body
        );
        
        res.json({
            success: true,
            message: 'Data asesi berhasil diubah',
            data: assesse,
        });
    });

    static deleteAssesse = asyncHandler(async (req: Request, res: Response) => {
        await AssesseeService.deleteAssesse(Number(req.params.id));
        
        res.json({
            success: true,
            message: 'Data asesi berhasil dihapus',
        });
    });
}