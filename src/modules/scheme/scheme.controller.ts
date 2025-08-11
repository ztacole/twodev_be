
import { Request, Response } from 'express';
import { SchemeService } from './scheme.service';
import { asyncHandler } from '../../common/async.handler';

export class SchemeController {
  static createScheme = asyncHandler(async function (req: Request, res: Response) {
      const scheme = await SchemeService.createScheme(req.body);

      res.status(201).json({
        success: true,
        message: 'Skema berhasil dibuat',
        data: scheme,
      });
  });

  static getSchemes = asyncHandler(async function (req: Request, res: Response) {
    const schemes = await SchemeService.getSchemes();
    
    res.json({
      success: true,
      message: 'Skema berhasil diambil',
      data: schemes,
    });
  });

  static getSchemeById = asyncHandler(async function (req: Request, res: Response) {
    const scheme = await SchemeService.getSchemeById(Number(req.params.id));
    
    res.json({
      success: true,
      message: 'Skema berhasil diambil',
      data: scheme,
    });
  });

  static updateScheme = asyncHandler(async function (req: Request, res: Response) {
    const scheme = await SchemeService.updateScheme(Number(req.params.id), req.body);
    
    res.json({
      success: true,
      message: 'Skema berhasil diperbarui',
      data: scheme,
    });
  });

  static deleteScheme = asyncHandler(async function (req: Request, res: Response) {
    const scheme = await SchemeService.deleteScheme(Number(req.params.id));

    res.json({
      success: true,
      message: 'Skema berhasil dihapus',
    });
  });

  static exportSchemesToExcel = asyncHandler(async function (req: Request, res: Response) {
    const buffer = await SchemeService.exportSchemesToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=schemes.xlsx');
    res.send(buffer);
  });
}