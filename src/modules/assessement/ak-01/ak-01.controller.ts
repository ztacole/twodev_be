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
      const result = await AK01Service.createAK01(data);
      
      res.status(201).json({
        success: true,
        message: 'AK01 berhasil dibuat',
        data: result
      });
    });
  
    static getAK01ById = asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const result = await AK01Service.getAK01ById(id);
      
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil diambil',
        data: result
      });
    });
  
    static getAK01ByResultId = asyncHandler(async (req: Request, res: Response) => {
      const resultId = parseInt(req.params.resultId);
      const result = await AK01Service.getAK01ByResultId(resultId);
      
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil diambil',
        data: result
      });
    });
  
    static updateAK01 = asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const data: AK01UpdateRequest = req.body;
      const result = await AK01Service.updateAK01(id, data);
      
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil diperbarui',
        data: result
      });
    });
  
    static deleteAK01 = asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      await AK01Service.deleteAK01(id);
      
      res.status(200).json({
        success: true,
        message: 'AK01 berhasil dihapus'
      });
    });
}