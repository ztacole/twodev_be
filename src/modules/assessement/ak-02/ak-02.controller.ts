import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AK02Service } from './ak-02.service';
import { 
  AK02CreateRequest, 
  AK02UpdateRequest 
} from './ak-02.type';

export class AK02Controller {
  static createAK02 = asyncHandler(async (req: Request, res: Response) => {
    const data: AK02CreateRequest = req.body;

    if(!data) {
      return res.status(400).json({
        success: false,
        message: 'Data diperlukan'
      });
    }

    try {
      const result = await AK02Service.createAK02(data);
      res.status(201).json({
        success: true,
        message: 'AK02 berhasil dibuat',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal membuat AK02',
        error: error.message
      });
    }
  });

  static getAK02ById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if(!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    try {
      const result = await AK02Service.getAK02ById(id);
      res.status(200).json({
        success: true,
        message: 'AK02 berhasil diambil',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK02',
        error: error.message
      });
    }
  });

  static getAK02ByResultId = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if(!resultId) {
      return res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
    }

    try {
      const result = await AK02Service.getResultDetails(resultId);
      res.status(200).json({
        success: true,
        message: 'AK02 berhasil diambil',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK02',
        error: error.message
      });
    }
  });

  static updateAK02 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AK02UpdateRequest = req.body;

    if(!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    if(!data) {
      return res.status(400).json({
        success: false,
        message: 'Data diperlukan'
      });
    }

    try {
      const result = await AK02Service.updateAK02(id, data);
      res.status(200).json({
        success: true,
        message: 'AK02 berhasil diperbarui',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui AK02',
        error: error.message
      });
    }
  });

  static deleteAK02 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if(!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    try {
      await AK02Service.deleteAK02(id);    
      res.status(200).json({
        success: true,
        message: 'AK02 berhasil dihapus'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus AK02',
        error: error.message
      });
    }
  });

  static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if(!resultId) {
      return res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
    }

    try {
      const result = await AK02Service.approvedByAssessor(resultId);
      
      res.status(200).json({
        success: true,
        message: 'AK02 berhasil disetujui',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui AK02',
        error: error.message,
      });
    }
  });

  static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if(!resultId) {
      return res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
    }

    try {
      const result = await AK02Service.approvedByAssessee(resultId);
      
      res.status(200).json({
        success: true,
        message: 'AK02 berhasil disetujui',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui AK02',
        error: error.message,
      });
    }
  });
}