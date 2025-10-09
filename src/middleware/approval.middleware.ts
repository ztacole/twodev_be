import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../modules/auth/auth.type';
import { db } from '../config/drizzle';
import { admin as adminTable, approvalRequest as approvalRequestTable, user as userTable, occupation as occupationTable, scheme as schemeTable, assessment as assessmentTable, assessmentSchedule as scheduleTable } from '../../drizzle/schema';
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
      let comment = body.comment ?? params.comment ?? query.comment ?? headers['x-approval-comment'];
      const targetId = Number(
        req.params.id ?? req.body.id ??
        (req.params as any)?.assessmentId ?? (req.params as any)?.assessment_id ??
        (req.body as any)?.assessmentId ?? (req.body as any)?.assessment_id
      );
      if (!Number.isFinite(targetId) || targetId <= 0) {
        return res.status(400).json({ success: false, message: 'Target id wajib diisi dan valid' });
      }
      const approverAdminId = Number(approverAdminRaw);
      if (!approverAdminId || approverAdminId === admin.id) {
        return res.status(400).json({ success: false, message: 'Pilih admin lain sebagai approver' });
      }

      const firstApprover = await db.query.admin.findFirst({ where: eq(adminTable.id, approverAdminId) });
      if (!firstApprover) {
        return res.status(400).json({ success: false, message: 'Approver pertama tidak ditemukan (admin.id tidak valid)' });
      }
      if (!firstApprover.can_approve) {
        return res.status(400).json({ success: false, message: 'Approver ini tidak memiliki izin approve' });
      }

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

      let targetName: string | null = null;
      try {
        switch (targetTable) {
          case 'user': {
            const u = await db.query.user.findFirst({ where: eq(userTable.id, targetId) });
            targetName = u?.full_name ?? null;
            break;
          }
          case 'occupation': {
            const o = await db.query.occupation.findFirst({ where: eq(occupationTable.id, targetId) });
            targetName = o?.name ?? null;
            break;
          }
          case 'scheme': {
            const s = await db.query.scheme.findFirst({ where: eq(schemeTable.id, targetId) });
            targetName = s ? (s.code || s.name) : null;
            break;
          }
          case 'assessment': {
            const a = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, targetId) });
            targetName = a?.code ?? null;
            break;
          }
          case 'schedule': {
            const sch = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, targetId) });
            if (sch) {
              const asmt = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, sch.assessment_id) });
              const occ = asmt ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, asmt.occupation_id) }) : null;
              const fmt = (d: any) => d instanceof Date ? d.toISOString().slice(0,10) : new Date(d as any).toISOString().slice(0,10);
              const start = sch.start_date ? fmt(sch.start_date as any) : '';
              const end = sch.end_date ? fmt(sch.end_date as any) : '';
              targetName = `${occ?.name ?? 'Schedule'} — ${start} s/d ${end}`;
            } else {
              targetName = null;
            }
            break;
          }
          default:
            targetName = null;
        }
      } catch { }

      const approvers = await db.query.admin.findMany({
        where: eq(adminTable.can_approve, true),
        columns: { id: true, can_approve: true as any }
      });
      const autoBackup = approvers.find(a => a.id !== approverAdminId && a.id !== admin.id);
      const backupAdminId = autoBackup?.id ?? (admin.can_approve && admin.id !== approverAdminId ? admin.id : null);

      const insertResult = await db.insert(approvalRequestTable).values({
        requester_admin_id: admin.id,
        approver_admin_id: approverAdminId,
        backup_admin_id: backupAdminId,
        target_table: targetTable,
        target_id: targetId,
        target_name: targetName ?? null,
        action: method === 'DELETE' ? 'delete' : 'update',
        status: 'pending',
        comment: comment ?? null,
      }).execute();

      const createdId = Number((insertResult as any)?.[0]?.insertId ?? (insertResult as any)?.insertId);
      let created = null as any;
      if (Number.isFinite(createdId) && createdId > 0) {
        created = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, createdId) });
      } else {
        created = await db.query.approvalRequest.findFirst({
          where: (t, { and, eq: _eq }) => and(
            _eq(t.requester_admin_id, admin.id),
            _eq(t.approver_admin_id, approverAdminId),
            _eq(t.target_table, targetTable),
            _eq(t.target_id, targetId),
            _eq(t.action, method === 'DELETE' ? 'delete' : 'update'),
            _eq(t.status, 'pending')
          ),
          orderBy: (t, { desc }) => desc(t.created_at),
        });
      }

      return res.status(202).json({ success: true, message: 'Menunggu persetujuan admin lain', data: created });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Gagal membuat approval request' });
    }
  };
}


