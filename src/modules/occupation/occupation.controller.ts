import { Request, Response } from 'express';
import { OccupationService } from './occupation.service';
import { OccupationRequest } from './occupation.type';
import { asyncHandler } from '../../common/async.handler';

export class OccupationController {
    static createOccupation = asyncHandler(async (req: Request, res: Response) => {
        const occupationData: OccupationRequest = req.body;
        const occupation = await OccupationService.createOccupation(occupationData);

        res.status(201).json({
            success: true,
            message: 'Occupation berhasil dibuat',
            data: occupation,
        });
    });

    static getOccupations = asyncHandler(async (req: Request, res: Response) => {
        const occupations = await OccupationService.getOccupations();

        res.json({
            success: true,
            message: 'Data occupation berhasil diambil',
            data: occupations,
        });
    });

    static getOccupationById = asyncHandler(async (req: Request, res: Response) => {
        const occupation = await OccupationService.getOccupationById(Number(req.params.id));

        res.json({
            success: true,
            message: 'Data occupation berhasil diambil',
            data: occupation,
        });
    });

    static updateOccupation = asyncHandler(async (req: Request, res: Response) => {
        const occupation = await OccupationService.updateOccupation(
            Number(req.params.id),
            req.body
        );

        res.json({
            success: true,
            message: 'Occupation berhasil diperbarui',
            data: occupation,
        });
    });

    static deleteOccupation = asyncHandler(async (req: Request, res: Response) => {
        const occupation = await OccupationService.deleteOccupation(Number(req.params.id));

        res.json({
            success: true,
            message: 'Occupation berhasil dihapus',
        });
    });

    static exportOccupationsToExcel = asyncHandler(async (req: Request, res: Response) => {
        const buffer = await OccupationService.exportOccupationsToExcel();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=occupations.xlsx');

        res.send(buffer);
    });
}
