import { Request, Response } from 'express';
import { DashboardAssessorService } from './assessor.service';
import { asyncHandler } from '../../../common/async.handler';

export class DashboardAssessorController {
    static getAPL02Assessee = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const scheduleId = Number(req.params.scheduleId);
        const type = req.params.type;
        if (!scheduleId || !assessorId || !type) {
            return res.status(400).json({ success: false, message: 'Assessor ID, Schedule ID, dan Type is required' });
        }
        const data = await DashboardAssessorService.getAssesseeData(assessorId, scheduleId, type);

        res.json({
            success: true,
            message: 'Data assessment mandiri berhasil diambil',
            data,
        });
    });
}
