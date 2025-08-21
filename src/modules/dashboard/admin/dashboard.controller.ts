import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getSummary(req: Request, res: Response) {
    try {
      const data = await DashboardService.getSummary();
      return res.status(200).json({
        success: true,
        message: 'Data summary dashboard berhasil diambil',
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getSchedules(req: Request, res: Response) {
    try {
      const data = await DashboardService.getSchedules();
      return res.status(200).json({
        success: true,
        message: 'Data jadwal assessment berhasil diambil',
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getVerificationDocs(req: Request, res: Response) {
    try {
      const data = await DashboardService.getVerificationDocs();
      return res.status(200).json({
        success: true,
        message: 'Data verifikasi dokumen berhasil diambil',
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getDashboardData(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardData();
      return res.status(200).json({
        success: true,
        message: 'Data dashboard berhasil diambil',
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
