import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AK04Service } from './ak-04.service';

export class AK04Controller {
  static createAK04 = asyncHandler(async function (req: Request, res: Response) {
    try {
      const data = await AK04Service.createAK04(req.body);
      res.status(201).json({
        success: true,
        message: 'AK-04 berhasil dibuat',
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal membuat AK-04',
        error: error.message,
      });
    }
  });

  static getAK04ByResultId = asyncHandler(async function (req: Request, res: Response) {
    try {
      const resultId = Number(req.params.resultId);

      if(!resultId) {
        return res.status(400).json({
          success: false,
          message: 'Result ID diperlukan',
        });
      }

      const data = await AK04Service.getResultDetails(resultId);
      res.status(200).json({
        success: true,
        message: 'AK-04 fetched',
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK-04',
        error: error.message,
      });
    }
  });

  static approvedByAssessee = asyncHandler(async function (req: Request, res: Response) {
    try {
      const resultId = Number(req.params.resultId);

      if(!resultId) {
        return res.status(400).json({
          success: false,
          message: 'Result ID diperlukan',
        });
      }

      const data = await AK04Service.approvedByAssessee(resultId);
      res.status(200).json({
        success: true,
        message: 'AK-04 berhasil disetujui',
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui AK-04',
        error: error.message,
      });
    }
  });
}
