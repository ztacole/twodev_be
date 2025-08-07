import { Request, Response } from 'express';
import * as unitCompetencyService from './unit-competency.service';
import { UnitCompetencyRequest } from './unit-competency.type';

export const createUnitCompetency = async (req: Request, res: Response) => {
    try {
        const unitCompetencyData: UnitCompetencyRequest = req.body;
        const unitCompetency = await unitCompetencyService.createUnitCompetency(unitCompetencyData);

        res.status(201).json({
            success: true,
            message: 'Unit kompetensi berhasil dibuat',
            data: unitCompetency,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const getUnitCompetencies = async (req: Request, res: Response) => {
    try {
        const unitCompetencies = await unitCompetencyService.getUnitCompetencies();

        res.json({
            success: true,
            message: 'Data unit kompetensi berhasil diambil',
            data: unitCompetencies,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const getUnitCompetencyById = async (req: Request, res: Response) => {
    try {
        const unitCompetency = await unitCompetencyService.getUnitCompetencyById(Number(req.params.id));

        if (!unitCompetency) {
            return res.status(404).json({
                success: false,
                message: 'Unit kompetensi tidak ditemukan',
            });
        }

        res.json({
            success: true,
            message: 'Data unit kompetensi berhasil diambil',
            data: unitCompetency,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const updateUnitCompetency = async (req: Request, res: Response) => {
    try {
        const unitCompetency = await unitCompetencyService.updateUnitCompetency(
            Number(req.params.id),
            req.body
        );

        if (!unitCompetency) {
            return res.status(404).json({
                success: false,
                message: 'Unit kompetensi tidak ditemukan',
            });
        }

        res.json({
            success: true,
            message: 'Unit kompetensi berhasil diperbarui',
            data: unitCompetency,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};

export const deleteUnitCompetency = async (req: Request, res: Response) => {
    try {
        const unitCompetency = await unitCompetencyService.deleteUnitCompetency(Number(req.params.id));

        if (!unitCompetency) {
            return res.status(404).json({
                success: false,
                message: 'Unit kompetensi tidak ditemukan',
            });
        }

        res.json({
            success: true,
            message: 'Unit kompetensi berhasil dihapus',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan pada server',
        });
    }
};