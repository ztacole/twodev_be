
import { Request, Response } from 'express';
import * as assessorService from './assessor.service';

export const createAssessor = async (req: Request, res: Response) => {
  try {
    const assessor = await assessorService.createAssessor(req.body);
    res.status(201).json({
      success: true,
      message: 'Data Assessor Berhasil Ditambahkan',
      data: assessor,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssessors = async (req: Request, res: Response) => {
  try {
    const assessors = await assessorService.getAssessors();
    res.json({
      success: true,
      message: 'Data Assessor Berhasil Diambil',
      data: assessors,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssessorById = async (req: Request, res: Response) => {
  try {
    const assessor = await assessorService.getAssessorById(Number(req.params.id));
    if (!assessor) {
      return res.status(404).json({
        success: false,
        message: 'Data Assessor Tidak Ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data Assessor Berhasil Diambil',
      data: assessor,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAssessor = async (req: Request, res: Response) => {
  try {
    const assessor = await assessorService.updateAssessor(Number(req.params.id), req.body);
    if (!assessor) {
      return res.status(404).json({
        success: false,
        message: 'Data Assessor Tidak Ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data Assessor Berhasil Diubah',
      data: assessor,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAssessor = async (req: Request, res: Response) => {
  try {
    const assessor = await assessorService.deleteAssessor(Number(req.params.id));
    if (!assessor) {
      return res.status(404).json({
        success: false,
        message: 'Data Assessor Tidak Ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data Assessor Berhasil Dihapus',
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
