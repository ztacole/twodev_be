import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../modules/auth/auth.type';
import { db } from '../config/drizzle';
import { admin as adminTable, approvalRequest as approvalRequestTable } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export function requireApproval(targetTable: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as JwtPayload;
      const admin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, user.id) });
      if (!admin) return res.status(403).json({ success: false, message: 'Hanya admin yang dapat melakukan aksi ini' });

      const method = req.method.toUpperCase();
      const isMutating = method === 'PUT' || method === 'PATCH' || method === 'DELETE';
      if (!isMutating) return next();

      const body: any = (req as any).body || {};
      const params: any = (req as any).params || {};
      const query: any = (req as any).query || {};
      const headers: any = (req as any).headers || {};
      const approverAdminRaw = body.approverAdminId ?? body.approver_admin_id ?? params.approverAdminId ?? params.approver_admin_id ?? query.approverAdminId ?? query.approver_admin_id ?? headers['x-approver-admin-id'];
      const secondApproverAdminRaw = body.secondApproverAdminId ?? body.second_approver_admin_id ?? params.secondApproverAdminId ?? params.second_approver_admin_id ?? query.secondApproverAdminId ?? query.second_approver_admin_id ?? headers['x-second-approver-admin-id'];
      let comment = body.comment ?? params.comment ?? query.comment ?? headers['x-approval-comment'];
      const targetId = Number(
        req.params.id ?? req.body.id ??
        (req.params as any)?.assessmentId ?? (req.params as any)?.assessment_id ??
        (req.body as any)?.assessmentId ?? (req.body as any)?.assessment_id
      );
      if (!Number.isFinite(targetId) || targetId <= 0) {
        return res.status(400).json({ success: false, message: 'Target id wajib diisi dan valid' });
      }
      if (!approverAdminRaw || Number(approverAdminRaw) === admin.id) {
        return res.status(400).json({ success: false, message: 'Pilih admin lain sebagai approver pertama' });
      }
      if (!secondApproverAdminRaw || Number(secondApproverAdminRaw) === admin.id || Number(secondApproverAdminRaw) === Number(approverAdminRaw)) {
        return res.status(400).json({ success: false, message: 'Pilih admin lain (berbeda) sebagai approver kedua' });
      }

      // Validate approver existence in admin table to avoid FK constraint errors
      const firstApprover = await db.query.admin.findFirst({ where: eq(adminTable.id, Number(approverAdminRaw)) });
      if (!firstApprover) {
        return res.status(400).json({ success: false, message: 'Approver pertama tidak ditemukan (admin.id tidak valid)' });
      }
      const secondApprover = await db.query.admin.findFirst({ where: eq(adminTable.id, Number(secondApproverAdminRaw)) });
      if (!secondApprover) {
        return res.status(400).json({ success: false, message: 'Approver kedua tidak ditemukan (admin.id tidak valid)' });
      }

      // For occupation update with multipart, capture temp file info to move on approve
      if ((req as any).file && targetTable === 'occupation' && method !== 'DELETE') {
        try {
          const existing = comment ? JSON.parse(String(comment)) : {};
          const merged = {
            ...existing,
            tempFilePath: (req as any).file.path,
            tempDestination: (req as any).file.destination,
            tempFileName: (req as any).file.filename,
            name: body.name ?? existing.name,
            scheme_id: body.scheme_id ? Number(body.scheme_id) : existing.scheme_id,
          };
          comment = JSON.stringify(merged);
        } catch {
          comment = JSON.stringify({ tempFilePath: (req as any).file.path, tempDestination: (req as any).file.destination, tempFileName: (req as any).file.filename, name: body.name, scheme_id: body.scheme_id ? Number(body.scheme_id) : undefined });
        }
      }

      const insertResult = await db.insert(approvalRequestTable).values({
        requester_admin_id: admin.id,
        approver_admin_id: Number(approverAdminRaw),
        second_approver_admin_id: Number(secondApproverAdminRaw),
        target_table: targetTable,
        target_id: targetId,
        action: method === 'DELETE' ? 'delete' : 'update',
        status: 'pending',
        comment: comment ?? null,
      }).execute();

      const createdId = Number((insertResult as any)?.insertId);
      let created = null as any;
      if (Number.isFinite(createdId) && createdId > 0) {
        created = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, createdId) });
      } else {
        created = await db.query.approvalRequest.findFirst({
          where: (t, { and, eq: _eq }) => and(
            _eq(t.requester_admin_id, admin.id),
            _eq(t.approver_admin_id, Number(approverAdminRaw)),
            _eq(t.target_table, targetTable),
            _eq(t.target_id, targetId),
            _eq(t.status, 'pending')
          ),
        });
      }

      return res.status(202).json({ success: true, message: 'Menunggu persetujuan admin lain', data: created });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Gagal membuat approval request' });
    }
  };
}


