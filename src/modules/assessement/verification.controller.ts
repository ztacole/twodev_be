import { Request, Response } from 'express';
import * as verificationService from './verification.service';

export const getPending = async (req: Request, res: Response) => {
  try {
    const data = await verificationService.getPendingVerifications();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.resultId);
    const data = await verificationService.getVerificationDetail(id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.resultId);
    const data = await verificationService.approveVerification(id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
