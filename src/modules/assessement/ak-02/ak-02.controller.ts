import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AK02Service } from './ak-02.service';
import { 
  AK02CreateRequest, 
  AK02UpdateRequest 
} from './ak-02.type';

export class AK02Controller {
  static sendResult = asyncHandler(async (req: Request, res: Response) => {
    const data: AK02CreateRequest = req.body;

    if(!data) {
      return res.status(400).json({
        success: false,
        message: 'Data diperlukan'
      });
    }

    try {
      const result = await AK02Service.sendResult(data);
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

  static getUnits = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = parseInt(req.params.assessmentId);

    if(!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID diperlukan'
      });
    }

    try {
      const result = await AK02Service.getUnits(assessmentId);
      res.status(200).json({
        success: true,
        message: 'Unit berhasil diambil',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil unit',
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