import { Request, Response } from 'express';
import { AssessorDetailService } from './assessor-detail.service';
import { asyncHandler } from '../../common/async.handler';

export class AssessorDetailController {
    static getByAssessorId = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const detail = await AssessorDetailService.getByAssessorId(assessorId);
        res.json({ success: true, data: detail });
    });

    static upsertByAssessorId = asyncHandler(async (req: Request, res: Response) => {
        const assessorId = Number(req.params.assessorId);
        const payload = req.body;
        const detail = await AssessorDetailService.upsertByAssessorId(assessorId, payload);
        res.json({ success: true, data: detail });
    });
}
