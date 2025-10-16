import { IAO2Service } from "./ia-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";
import path from 'path';
import fs from 'fs';

export class IA02Controller {
    static getIA02Groups = asyncHandler(async (req: Request, res: Response) => {
        const assessmentId = Number(req.params.assessmentId);
        if (!assessmentId) {
            return res.status(400).json({ success: false, message: 'Assessment ID is required' });
        }
        const iaGroups = await IAO2Service.getIA02Groups(assessmentId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const iaGroups = await IAO2Service.approveByAssessor(resultId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const iaGroups = await IAO2Service.approveByAssessee(resultId);
        res.status(200).json({
            success: true,
            message: 'Group IA berhasil diambil',
            data: iaGroups
        });
    })

    static getResultDetails = asyncHandler(async (req: Request, res: Response) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IAO2Service.getResultDetails(resultId);
        res.status(200).json({
            success: true,
            message: 'Hasil berhasil diambil',
            data: result
        });
    })

    static async uploadPdf(req: Request, res: Response) {
        try {
            const assessmentId = Number(req.params.assessmentId);

            if (!assessmentId) {
                return res.status(400).json({
                success: false,
                message: "Assessment ID dibutuhkan",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                success: false,
                message: "Tidak ada file yang diunggah",
                });
            }

            const fileName = req.file.filename;
            const filePath = req.file.path;

            const pdf = await IAO2Service.uploadPdf(assessmentId, filePath, fileName);

            return res.status(201).json({
                success: true,
                message: "PDF berhasil diupload",
                data: pdf,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Gagal upload PDF",
                error: error.message,
            });
        }
    }

    static async getPdf(req: Request, res: Response) {
        try {
            const scheduleId = Number(req.params.scheduleId);

            if (!scheduleId) {
            return res.status(400).json({
                success: false,
                message: "Schedule ID dibutuhkan",
            });
            }

            const { assessment_id, pdf } = await IAO2Service.getPdf(scheduleId);

            if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF tidak ditemukan",
            });
            }

            const filePath = path.join(
                __dirname,
                "../../../../public/uploads/ia-02",
                `assessment-${assessment_id}`,
                pdf.file_name
            );

            if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File PDF tidak ditemukan di server",
            });
            }

            return res.download(filePath, pdf.file_name);
        } catch (error: any) {
            return res.status(500).json({
            success: false,
            message: "Gagal mengambil PDF",
            error: error.message,
            });
        }
    }
}