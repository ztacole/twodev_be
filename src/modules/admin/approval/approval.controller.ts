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
      
      console.log('Request body:', req.body);
      console.log('Request body type:', typeof req.body);
      
      if (!req.body) {
        return res.status(400).json({ 
          success: false, 
          message: 'Request body tidak ditemukan. Pastikan Content-Type: application/json' 
        });
      }
      
      const body = req.body as any;
      
      const targetTable = body?.targetTable ?? body?.target_table;
      const targetId = body?.targetId ?? body?.target_id;
      const action = body?.action;
      const approverAdminRaw = body?.approverAdminId ?? body?.approver_admin_id;
      const secondApproverAdminRaw = body?.secondApproverAdminId ?? body?.second_approver_admin_id;
      const comment = body?.comment ?? null;

      if (!targetTable || !targetId || !action || !approverAdminRaw || !secondApproverAdminRaw) {
        return res.status(400).json({ 
          success: false, 
          message: 'targetTable/target_table, targetId/target_id, action, approverAdminId/approver_admin_id, dan secondApproverAdminId/second_approver_admin_id wajib diisi' 
        });
      }

      console.log('Parsed values:', {
        targetTable,
        targetId: Number(targetId),
        action,
        approverAdminId: Number(approverAdminRaw),
        secondApproverAdminId: Number(secondApproverAdminRaw),
        comment
      });

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
      const comment = (req as any).body?.comment ?? null;
      const data = await ApprovalService.resolveApprovalRequest({ id, user, decision: 'rejected', comment });
      res.json({ success: true, message: 'Approval request ditolak', data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Gagal menolak approval request' });
    }
  },

  async listApprovalRequests(req: Request, res: Response) {
    try {
      const user = req.user as JwtPayload;
      const scopeParam = (req.params.scope as string) || (req.query.scope as string) || 'all';
      const scope = (['all','to-approve','requested-by-me'] as const).includes(scopeParam as any) ? (scopeParam as 'all'|'to-approve'|'requested-by-me') : 'all';
      const data = await ApprovalService.listApprovalRequests(user, scope);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Gagal mengambil daftar approval requests' });
    }
  }
};