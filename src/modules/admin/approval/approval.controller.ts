import { Request, Response } from 'express';
import { ApprovalService } from './approval.services';
import type { JwtPayload } from '../../auth/auth.type';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const ApprovalController = {
  async approveApl01(req: Request, res: Response) {
    try {
      console.log("REQ BODY:", req.body);
      const user = req.user as JwtPayload;
      const { docId } = req.body;

      await ApprovalService.approveApl01Document(Number(docId), user);
      res.json({ success: true, message: 'Dokumen APL-01 approved' });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Gagal approve dokumen APL-01'
      });
    }
  },

  async approveCompetency(req: Request, res: Response) {
    try {
      const user = req.user as JwtPayload;
      const { resultId } = req.body;

      await ApprovalService.approveCompetency(Number(resultId), user);
      res.json({ success: true, message: 'Kompetensi approved' });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Gagal approve kompetensi'
      });
    }
  }
};