import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AK01Service } from './ak-01.service';
import { 
  AK01CreateRequest, 
  AK01UpdateRequest,
} from './ak-01.type';

export class AK01Controller {
  static createAK01 = asyncHandler(async (req: Request, res: Response) => {
    const data: AK01CreateRequest = req.body;

    if(!data) {
      return res.status(400).json({
        success: false,
        message: 'Data diperlukan'
      });
    }

    try {
      const result = await AK01Service.createAK01(data);
      res.status(201).json({
        success: true,
        message: 'AK01 berhasil dibuat',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal membuat AK01',
        error: error.message
      });
    }
  });

  static getDataForAK01 = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if(!resultId) {
      return res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
    }

    try {
      const result = await AK01Service.getDataForAK01(resultId);
      res.status(200).json({
        success: true,
        message: 'Data berhasil diambil',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data',
        error: error.message
      });
    }
  });

  static getAK01ById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if(!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    try {
      const result = await AK01Service.getAK01ById(id);
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil diambil',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK01',
        error: error.message
      });
    }
  });

  static getAK01ByResultId = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if(!resultId) {
      return res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
    }

    try {
      const result = await AK01Service.getAK01ByResultId(resultId);
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil diambil',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK01',
        error: error.message
      });
    }
  });

  static updateAK01 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AK01UpdateRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data diperlukan'
      });
    }

    try {
      const result = await AK01Service.updateAK01(id, data);
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil diperbarui',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui AK01',
        error: error.message
      });
    }
  });

  static deleteAK01 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    try {
      await AK01Service.deleteAK01(id);
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil dihapus'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus AK01',
        error: error.message
      });
    }
  });

  static approvedByAssessor = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if (isNaN(resultId)) {
      res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
      return;
    }

    try {
      const result = await AK01Service.approvedByAssessor(resultId);

      res.status(200).json({
        success: true,
        message: 'AK01 berhasil disetujui',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui AK01',
        error: error.message
      });
    }
  });

  static approvedByAssessee = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);

    if (isNaN(resultId)) {
      res.status(400).json({
        success: false,
        message: 'Result ID diperlukan'
      });
      return;
    }

    try {
      const result = await AK01Service.approvedByAssessee(resultId);

      res.status(200).json({
        success: true,
        message: 'AK01 berhasil disetujui',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui AK01',
        error: error.message
      });
    }
  });
}