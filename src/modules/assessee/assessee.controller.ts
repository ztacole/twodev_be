
import { Request, Response } from 'express';
import * as assesseService from './assessee.service';

export const createAssesse = async (req: Request, res: Response) => {
  try {
    const assesse = await assesseService.createAssesse(req.body);
    res.status(201).json({
      success: true,
      message: 'Data asesi berhasil dibuat',
      data: assesse,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssesses = async (req: Request, res: Response) => {
  try {
    const assesses = await assesseService.getAssesses();
    res.json({
      success: true,
      message: 'Data asesi berhasil diambil',
      data: assesses,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssesseById = async (req: Request, res: Response) => {
  try {
    const assesse = await assesseService.getAssesseById(Number(req.params.id));
    if (!assesse) {
      return res.status(404).json({
        success: false,
        message: 'Data asesi tidak ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data asesi berhasil diambil',
      data: assesse,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAssesse = async (req: Request, res: Response) => {
  try {
    const assesse = await assesseService.updateAssesse(
      Number(req.params.id),
      req.body
    );
    if (!assesse) {
      return res.status(404).json({
        success: false,
        message: 'Data asesi tidak ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data asesi berhasil diubah',
      data: assesse,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAssesse = async (req: Request, res: Response) => {
  try {
    const assesse = await assesseService.deleteAssesse(Number(req.params.id));
    if (!assesse) {
      return res.status(404).json({
        success: false,
        message: 'Data asesi tidak ditemukan',
      });
    }
    res.json({
      success: true,
      message: 'Data asesi berhasil dihapus',
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
