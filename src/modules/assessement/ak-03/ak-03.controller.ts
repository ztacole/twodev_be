import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AK03Service } from './ak-03.service';

export class AK03Controller {
  static createAK03 = asyncHandler(async function (req: Request, res: Response) {
    try {
      const data = await AK03Service.createAK03(req.body);
      res.status(201).json({
        success: true,
        message: 'AK-03 berhasil dibuat',
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal membuat AK-03',
        error: error.message,
      });
    }
  });

  static getAK03ByResultId = asyncHandler(async function (req: Request, res: Response) {
    try {
      const { result_id } = req.params;
      const data = await AK03Service.getResultDetails(Number(result_id));
      if (!data) {
        return res.status(404).json({ success: false, message: 'AK-03 tidak ditemukan' });
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK-03',
        error: error.message,
      });
    }
  });
}
