import { Request, Response } from 'express';
import * as occupationService from './occupation.service';
import { OccupationRequest } from './occupation.type';

export const createOccupation = async (req: Request, res: Response) => {
    try {
        const occupationData: OccupationRequest = req.body;
        const occupation = await occupationService.createOccupation(occupationData);

        res.status(201).json({
            success: true,
            message: 'Occupation berhasil dibuat',
            data: occupation,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const getOccupations = async (req: Request, res: Response) => {
    try {
        const occupations = await occupationService.getOccupations();

        res.json({
            success: true,
            message: 'Data occupation berhasil diambil',
            data: occupations,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const getOccupationById = async (req: Request, res: Response) => {
    try {
        const occupation = await occupationService.getOccupationById(Number(req.params.id));

        if (!occupation) {
            return res.status(404).json({
                success: false,
                message: 'Occupation tidak ditemukan',
            });
        }

        res.json({
            success: true,
            message: 'Data occupation berhasil diambil',
            data: occupation,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const updateOccupation = async (req: Request, res: Response) => {
    try {
        const occupation = await occupationService.updateOccupation(
            Number(req.params.id),
            req.body
        );

        if (!occupation) {
            return res.status(404).json({
                success: false,
                message: 'Occupation tidak ditemukan',
            });
        }

        res.json({
            success: true,
            message: 'Occupation berhasil diperbarui',
            data: occupation,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const deleteOccupation = async (req: Request, res: Response) => {
    try {
        const occupation = await occupationService.deleteOccupation(Number(req.params.id));

        if (!occupation) {
            return res.status(404).json({
                success: false,
                message: 'Occupation tidak ditemukan',
            });
        }

        res.json({
            success: true,
            message: 'Occupation berhasil dihapus',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const exportOccupationsToExcel = async (req: Request, res: Response) => {
    try {
        const { exportOccupationsToExcel } = require('./occupation.service');
        
        // Generate Excel buffer
        const buffer = await exportOccupationsToExcel();
        
        // Set headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=occupations.xlsx');
        
        // Send the Excel file
        res.send(buffer);
    } catch (error: any) {
        console.error('Error exporting occupations to Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengekspor data ke Excel',
        });
    }
};