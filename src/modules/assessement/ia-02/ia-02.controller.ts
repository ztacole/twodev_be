import { IAO2Service } from "./ia-02.service";
import { asyncHandler } from "../../../common/async.handler";
import { Request, Response } from "express";

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
                message: "Group ID dibutuhkan",
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
            const assessmentId = Number(req.params.assessmentId);

            if (!assessmentId) {
                return res.status(400).json({
                success: false,
                message: "Group ID dibutuhkan",
                });
            }

            const pdf = await IAO2Service.getPdf(assessmentId);

            if (!pdf) {
                return res.status(404).json({
                success: false,
                message: "PDF tidak ditemukan",
                });
            }

            return res.status(200).json({
                success: true,
                message: "PDF berhasil diambil",
                data: pdf,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil PDF",
                error: error.message,
            });
        }
    }
}