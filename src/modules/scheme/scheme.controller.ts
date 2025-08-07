
import { Request, Response } from 'express';
import * as schemeService from './scheme.service';

export const createScheme = async (req: Request, res: Response) => {
  try {
    const scheme = await schemeService.createScheme(req.body);

    res.status(201).json({
      success: true,
      message: 'Skema berhasil dibuat',
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const getSchemes = async (req: Request, res: Response) => {
  try {
    const schemes = await schemeService.getSchemes();

    res.json({
      success: true,
      message: 'Skema berhasil diambil',
      data: schemes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const getSchemeById = async (req: Request, res: Response) => {
  try {
    const scheme = await schemeService.getSchemeById(Number(req.params.id));

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Skema tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Skema berhasil diambil',
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const updateScheme = async (req: Request, res: Response) => {
  try {
    const scheme = await schemeService.updateScheme(
      Number(req.params.id),
      req.body
    );

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Skema tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Skema berhasil diperbarui',
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export const deleteScheme = async (req: Request, res: Response) => {
  try {
    const scheme = await schemeService.deleteScheme(Number(req.params.id));

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Skema tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Skema berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

