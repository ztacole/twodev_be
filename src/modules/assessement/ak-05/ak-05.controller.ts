import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AK05Service } from './ak-05.service';

export class AK05Controller {
  static createAK05 = asyncHandler(async function (req: Request, res: Response) {
    try {
      const data = await AK05Service.createAK05(req.body);
      res.status(201).json({
        success: true,
        message: 'AK-05 created',
        data: data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal membuat AK-05',
        error: error.message,
      });
    }
  });

  static getAK05ByResultId = asyncHandler(async function (req: Request, res: Response) {
    try {
      const { result_id } = req.params;
      const data = await AK05Service.getAK05ByResultId(Number(result_id));
      if (!data) {
        return res.status(404).json({ success: false, message: 'AK-05 tidak ditemukan' });
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil AK-05',
        error: error.message,
      });
    }
  });
}
