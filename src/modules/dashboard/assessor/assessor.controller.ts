import { Request, Response } from 'express';
import { DashboardAssessorService } from './assessor.service';
import { asyncHandler } from '../../../common/async.handler';

export class DashboardAssessorController {
    static getAssessmentMandiriByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const data = await DashboardAssessorService.getAssessmentMandiriByAssessor(assessorId);

        res.json({
            success: true,
            message: 'Data assessment mandiri berhasil diambil',
            data,
        });
    });

    static getPenilaianByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const data = await DashboardAssessorService.getPenilaianByAssessor(assessorId);

        res.json({
            success: true,
            message: 'Data penilaian berhasil diambil',
            data,
        });
    });
}
