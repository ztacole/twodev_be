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

      const result = await ApprovalService.approveApl01Document(Number(docId), user);
      res.json({
        success: true,
        message: 'Dokumen APL-01 approved',
        data: result
      });
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
  },

  async createApprovalRequest(req: Request, res: Response) {
    try {
      const user = req.user as JwtPayload;
      const { targetTable, targetId, action } = req.body;
      const approverAdminRaw = (req.body as any).approverAdminId ?? (req.body as any).approver_admin_id;
      const secondApproverAdminRaw = (req.body as any).secondApproverAdminId ?? (req.body as any).second_approver_admin_id;
      const comment = (req.body as any).comment ?? null;

      const data = await ApprovalService.createApprovalRequest({
        user,
        approverAdminId: Number(approverAdminRaw),
        secondApproverAdminId: Number(secondApproverAdminRaw),
        targetTable,
        targetId: Number(targetId),
        action,
        comment,
      });

      res.json({ success: true, message: 'Approval request created', data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Gagal membuat approval request' });
    }
  },

  async approveRequest(req: Request, res: Response) {
    try {
      const user = req.user as JwtPayload;
      const id = Number(req.params.id);
      const data = await ApprovalService.resolveApprovalRequest({ id, user, decision: 'approved' });
      res.json({ success: true, message: 'Approval request disetujui', data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Gagal menyetujui approval request' });
    }
  },

  async rejectRequest(req: Request, res: Response) {
    try {
      const user = req.user as JwtPayload;
      const id = Number(req.params.id);
      const { comment } = req.body as any;
      const data = await ApprovalService.resolveApprovalRequest({ id, user, decision: 'rejected', comment: comment ?? null });
      res.json({ success: true, message: 'Approval request ditolak', data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Gagal menolak approval request' });
    }
  },

  async listApprovalRequests(req: Request, res: Response) {
    try {
      const user = req.user as JwtPayload;
      const data = await ApprovalService.listApprovalRequests(user);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Gagal mengambil daftar approval requests' });
    }
  }
};