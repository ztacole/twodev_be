import { Request, Response } from 'express';
import * as verificationService from './verification.service';

export const getPending = async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.scheduleDetailId ?? (req.query.schedule_detail_id as any);
    const parsed = rawParam !== undefined ? Number(rawParam) : undefined;
    const scheduleDetailId = parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined;
    const data = await verificationService.getPendingVerifications(scheduleDetailId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApproved = async (req: Request, res: Response) => {
  try {
    const raw = req.params.scheduleDetailId ?? req.query.schedule_detail_id;

    let scheduleDetailId: number | undefined;
    if (raw !== undefined && raw !== null && raw !== '') {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        return res.status(400).json({ success: false, message: 'scheduleDetailId tidak valid' });
      }
      scheduleDetailId = parsed;
    }

    const data = await verificationService.getApprovedVerifications(scheduleDetailId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.resultId);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'resultId tidak valid' });
    const data = await verificationService.getVerificationDetail(id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const id = Number(req.params.resultId);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'resultId tidak valid' });
    const data = await verificationService.approveVerification(id, user.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveByScheduleDetail = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const raw = req.params.scheduleDetailId ?? (req.body as any)?.schedule_detail_id;
    const parsed = raw !== undefined && raw !== null && raw !== '' ? Number(raw) : NaN;
    if (!Number.isFinite(parsed)) return res.status(400).json({ success: false, message: 'scheduleDetailId tidak valid' });
    const scheduleDetailId = parsed;
    const data = await verificationService.approveVerificationByScheduleDetail(scheduleDetailId, user.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByScheduleDetail = async (req: Request, res: Response) => {
  try {
    const parsed = Number(req.params.scheduleDetailId);
    if (Number.isNaN(parsed)) return res.status(400).json({ success: false, message: 'scheduleDetailId tidak valid' });
    const scheduleDetailId = parsed;
    const data = await verificationService.getVerificationsByScheduleDetail(scheduleDetailId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
