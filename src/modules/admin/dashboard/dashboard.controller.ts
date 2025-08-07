import { Request, Response } from 'express';

import * as dashboardService from './dashboard.service';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getDashboardData();
    return res.status(200).json({
      success: true,
      message: 'Data dashboard berhasil diambil',
      data: data,
    });
  } catch (error : any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
