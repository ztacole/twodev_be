import { Request, Response } from 'express';
import { OccupationService } from './occupation.service';
import { OccupationRequest } from './occupation.type';
import { asyncHandler } from '../../common/async.handler';
import { cleanString } from '../../helper/string';

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
        const schemeId = req.query.scheme_id ? Number(req.query.scheme_id) : undefined;
        const occupations = (schemeId) ? await OccupationService.getOccupations(schemeId) : await OccupationService.getOccupations();

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
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak ada file yang diunggah',
                });
            }

            const occupation = await OccupationService.updateOccupation(
                Number(req.params.id),
                req.body
            );

            res.json({
                success: true,
                message: 'Occupation berhasil diperbarui',
                data: {
                    ...occupation,
                    uploadedFile: file
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Gagal memperbarui occupation',
                error: error.message
            });
        }
    });

    static deleteOccupation = asyncHandler(async (req: Request, res: Response) => {
        const getoccupation = await OccupationService.getOccupationById(Number(req.params.id));
        const occupationId = Number(req.params.id);
        const schemaId = getoccupation.scheme.id;
        const name = cleanString(getoccupation.name);

        const occupation = await OccupationService.deleteOccupation(occupationId, schemaId, name);

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

    static getUploadedPdf = asyncHandler(async (req: Request, res: Response) => {
        try {
            const occupation = await OccupationService.getOccupationById(Number(req.params.id));
            const occupationId = Number(req.params.id);
            const schemaId = occupation.scheme.id;
            const name = cleanString(occupation.name);
            const pdf = await OccupationService.getUploadedPdf(occupationId, schemaId, name);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=occupation-${name}.pdf`);
            res.send(pdf);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil PDF',
                error: error.message
            });
        }
    })
}
