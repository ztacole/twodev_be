import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/async.handler';
import { AKService } from './ak.service';
import { 
  AK01CreateRequest, 
  AK01UpdateRequest, 
  AK02CreateRequest, 
  AK02UpdateRequest 
} from './ak.type';

export class AKController {
  // AK01 Controllers

  static createAK01 = asyncHandler(async (req: Request, res: Response) => {
    const data: AK01CreateRequest = req.body;
    const result = await AKService.createAK01(data);
    
    res.status(201).json({
      success: true,
      message: 'AK01 berhasil dibuat',
      data: result
    });
  });

  static getAK01ById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await AKService.getAK01ById(id);
    
    res.status(200).json({
      success: true,
      message: 'AK01 berhasil diambil',
      data: result
    });
  });

  static getAK01ByResultId = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);
    const result = await AKService.getAK01ByResultId(resultId);
    
    res.status(200).json({
      success: true,
      message: 'AK01 berhasil diambil',
      data: result
    });
  });

  static updateAK01 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AK01UpdateRequest = req.body;
    const result = await AKService.updateAK01(id, data);
    
    res.status(200).json({
      success: true,
      message: 'AK01 berhasil diperbarui',
      data: result
    });
  });

  static deleteAK01 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await AKService.deleteAK01(id);
    
    res.status(200).json({
      success: true,
      message: 'AK01 berhasil dihapus'
    });
  });

  // AK02 Controllers

  static createAK02 = asyncHandler(async (req: Request, res: Response) => {
    const data: AK02CreateRequest = req.body;
    const result = await AKService.createAK02(data);
    
    res.status(201).json({
      success: true,
      message: 'AK02 berhasil dibuat',
      data: result
    });
  });

  static getAK02ById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await AKService.getAK02ById(id);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil diambil',
      data: result
    });
  });

  static getAK02ByResultId = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);
    const result = await AKService.getAK02ByResultId(resultId);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil diambil',
      data: result
    });
  });

  static updateAK02 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data: AK02UpdateRequest = req.body;
    const result = await AKService.updateAK02(id, data);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil diperbarui',
      data: result
    });
  });

  static deleteAK02 = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await AKService.deleteAK02(id);
    
    res.status(200).json({
      success: true,
      message: 'AK02 berhasil dihapus'
    });
  });

  // Combined Controllers

  static getAKByResultId = asyncHandler(async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);
    const result = await AKService.getAKByResultId(resultId);
    
    res.status(200).json({
      success: true,
      message: 'Data AK berhasil diambil',
      data: result
    });
  });

  static getAllAK = asyncHandler(async (req: Request, res: Response) => {
    const result = await AKService.getAllAK();
    
    res.status(200).json({
      success: true,
      message: 'Semua data AK berhasil diambil',
      data: result
    });
  });
}