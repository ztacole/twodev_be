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
    const result = await AK02Service.createAK02(data);
    
    res.status(201).json({
      success: true,
      message: 'AK02 berhasil dibuat',
      data: result
    });
  });

  static getAK02ById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await AK02Service.getAK02ById(id);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil diambil',
      data: result
    });
  });

  static getAK02ByResultId = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);
    const result = await AK02Service.getAK02ByResultId(resultId);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil diambil',
      data: result
    });
  });

  static updateAK02 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AK02UpdateRequest = req.body;
    const result = await AK02Service.updateAK02(id, data);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil diperbarui',
      data: result
    });
  });

  static deleteAK02 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await AK02Service.deleteAK02(id);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil dihapus'
    });
  });
}