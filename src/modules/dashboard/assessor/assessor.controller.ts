import { Request, Response } from 'express';
import { DashboardAssessorService } from './assessor.service';
import { asyncHandler } from '../../../common/async.handler';

export class DashboardAssessorController {
    static getAPL02Assessee = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const assessmentId = Number(req.params.assessmentId);
        const type = req.params.type;
        if (!assessmentId || !assessorId || !type) {
            return res.status(400).json({ success: false, message: 'Assessor ID, Assessment ID, dan Type is required' });
        }
        const data = await DashboardAssessorService.getAssesseeData(assessorId, assessmentId, type);

        res.json({
            success: true,
            message: 'Data assessment mandiri berhasil diambil',
            data,
        });
    });
}
