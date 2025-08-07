
import { Request, Response } from 'express';
import * as assessementService from './assessement.service';

export const createAssessement = async (req: Request, res: Response) => {
  try {
    const assessement = await assessementService.createAssessement(req.body);
    res.status(201).json({
      success: true,
      message: 'Penilaian berhasil dibuat',
      data: assessement,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssessements = async (req: Request, res: Response) => {
  try {
    const assessements = await assessementService.getAssessements();
    res.json({
      success: true,
      message: 'Data penilaian berhasil diambil',
      data: assessements,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssessementById = async (req: Request, res: Response) => {
  try {
    const assessement = await assessementService.getAssessementById(Number(req.params.id));
    if (!assessement) {
      return res.status(404).json({
        success: false,
        message: 'Penilaian tidak ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data penilaian berhasil diambil',
      data: assessement,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAssessement = async (req: Request, res: Response) => {
  try {
    const assessement = await assessementService.updateAssessement(Number(req.params.id), req.body);
    if (!assessement) {
      return res.status(404).json({
        success: false,
        message: 'Penilaian tidak ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Penilaian berhasil diperbarui',
      data: assessement,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAssessement = async (req: Request, res: Response) => {
  try {
    const assessement = await assessementService.deleteAssessement(Number(req.params.id));
    if (!assessement) {
      return res.status(404).json({
        success: false,
        message: 'Penilaian tidak ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Penilaian berhasil dihapus',
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
