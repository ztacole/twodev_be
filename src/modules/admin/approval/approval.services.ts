import type { JwtPayload } from "../../auth/auth.type";
import { db } from "../../../config/drizzle";
import { admin as adminTable, resultDoc as resultDocTable, result as resultTable, approvalRequest as approvalRequestTable, user as userTable, occupation as occupationTable, scheme as schemeTable, assessmentSchedule as scheduleTable, scheduleDetail as scheduleDetailTable, assessment as assessmentTable } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const ApprovalService = {
  async approveApl01Document(docId: number, user: JwtPayload): Promise<any> {
    const admin = await db.query.admin.findFirst({
      where: eq(adminTable.user_id, user.id),
    });

    if (!admin) {
      throw new Error("Hanya admin yang dapat melakukan approval dokumen APL-01");
    }

    await db.update(resultDocTable).set({ approved: true }).where(eq(resultDocTable.id, docId));
    const resultDoc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.id, docId) });

    return resultDoc;
  },

  async approveCompetency(resultId: number, user: JwtPayload): Promise<void> {
    if (user.role_id !== 1) {
      throw new Error("Hanya admin yang dapat melakukan approval kompetensi");
    }

    await db.update(resultTable).set({ is_competent: true }).where(eq(resultTable.id, resultId));
  },

  async createApprovalRequest(input: {
    user: JwtPayload;
    approverAdminId: number;
    targetTable: string;
    targetId: number;
    action: string;
    comment: string | null;
  }) {
    const requester = await db.query.admin.findFirst({ where: eq(adminTable.user_id, input.user.id) });
    if (!requester) throw new Error("Hanya admin yang dapat membuat approval request");

    if (!input.approverAdminId || input.approverAdminId === requester.id) {
      throw new Error("Pilih admin lain sebagai approver");
    }
    const approverExists = await db.query.admin.findFirst({ where: eq(adminTable.id, input.approverAdminId) });
    if (!approverExists) {
      throw new Error("Approver tidak ditemukan (admin.id tidak valid)");
    }
    if (!approverExists.can_approve) {
      throw new Error("Approver ini tidak memiliki izin approve");
    }

    let targetName: string | null = null;
    const targetTableLower = (input.targetTable || '').toLowerCase();
    try {
      switch (targetTableLower) {
        case 'user': {
          const u = await db.query.user.findFirst({ where: eq(userTable.id, input.targetId) });
          targetName = u?.full_name ?? null;
          break;
        }
        case 'occupation': {
          const o = await db.query.occupation.findFirst({ where: eq(occupationTable.id, input.targetId) });
          targetName = o?.name ?? null;
          break;
        }
        case 'scheme': {
          const s = await db.query.scheme.findFirst({ where: eq(schemeTable.id, input.targetId) });
          targetName = s ? (s.code || s.name) : null;
          break;
        }
        case 'assessment': {
          const a = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, input.targetId) });
          targetName = a?.code ?? null;
          break;
        }
        case 'schedule': {
          const sch = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, input.targetId) });
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

    await db.insert(approvalRequestTable).values({
      requester_admin_id: requester.id,
      approver_admin_id: input.approverAdminId,
      target_table: input.targetTable,
      target_id: input.targetId,
      target_name: targetName,
      action: input.action,
      status: 'pending',
      comment: input.comment ?? null,
      approved_at: null as any,
    }).execute();

    const created = await db.query.approvalRequest.findFirst({
      where: (tbl, { eq, and }) => and(
        eq(tbl.requester_admin_id, requester.id),
        eq(tbl.approver_admin_id, input.approverAdminId),
        eq(tbl.target_table, input.targetTable),
        eq(tbl.target_id, input.targetId),
        eq(tbl.action, input.action)
      ),
      orderBy: (tbl, { desc }) => desc(tbl.created_at),
    });

    if (!created) {
      throw new Error("Gagal mengambil approval request yang baru dibuat");
    }

    return created;
  },

  async listApprovalRequests(user: JwtPayload, scope: 'all' | 'to-approve' | 'requested-by-me' = 'all') {
    const admin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, user.id) });
    if (!admin) throw new Error("Hanya admin yang dapat melihat approval request");

    if (scope === 'requested-by-me') {
      return await db.query.approvalRequest.findMany({
        where: (tbl, { eq: _eq }) => _eq(tbl.requester_admin_id, admin.id),
        orderBy: (tbl, { desc }) => desc(tbl.created_at),
      });
    }

    if (scope === 'to-approve') {
      return await db.query.approvalRequest.findMany({
        where: (tbl, { and, eq: _eq }) => and(
          _eq(tbl.approver_admin_id, admin.id),
          _eq(tbl.status, 'pending')
        ),
        orderBy: (tbl, { desc }) => desc(tbl.created_at),
      });
    }

    return await db.query.approvalRequest.findMany({
      where: (tbl, { or, eq: _eq }) => or(
        _eq(tbl.requester_admin_id, admin.id),
        _eq(tbl.approver_admin_id, admin.id)
      ),
      orderBy: (tbl, { desc }) => desc(tbl.created_at),
    });
  },

  async resolveApprovalRequest(input: { id: number; user: JwtPayload; decision: 'approved' | 'rejected'; comment?: string | null; }) {
    const admin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, input.user.id) });
    if (!admin) throw new Error("Hanya admin yang dapat memproses approval request");

    const request = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });
    if (!request) throw new Error("Approval request tidak ditemukan");
    if (request.status === 'rejected' || request.status === 'approved') throw new Error("Approval request sudah diproses");

    const isFirstApprover = request.approver_admin_id === admin.id;
    if (!isFirstApprover) throw new Error("Anda bukan approver untuk request ini");

    if (input.decision === 'approved') {
      await db.update(approvalRequestTable).set({
        status: 'approved',
        approved_at: new Date(),
        comment: input.comment ?? request.comment,
      }).where(eq(approvalRequestTable.id, input.id)).execute();

      const refreshed = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });
      if (!refreshed) throw new Error("Approval request tidak ditemukan setelah update");

      const action = (refreshed.action || '').toLowerCase();
      const targetTable = (refreshed.target_table || '').toLowerCase();
      const targetId = refreshed.target_id;

      const applyUpdate = async (commentRaw: string | null) => {
        if (!commentRaw) return;
        let changes: Record<string, any> | null = null;
        try {
          const parsed: any = JSON.parse(commentRaw);
          changes = parsed && typeof parsed === 'object' && parsed.changes ? parsed.changes : parsed;
        } catch { /* ignore parse error */ }
        if (!changes || typeof changes !== 'object') return;

        switch (targetTable) {
          case 'user':
            await db.update(userTable).set(changes).where(eq(userTable.id, targetId)).execute();
            break;
          case 'occupation': {
            const tempFilePath = (changes as any).tempFilePath;
            const tempDestination = (changes as any).tempDestination;
            const tempFileName = (changes as any).tempFileName;
            const schemeId = (changes as any).scheme_id;
            const name = (changes as any).name;

            const updateFields: any = { ...changes };
            delete updateFields.tempFilePath; delete updateFields.tempDestination; delete updateFields.tempFileName;
            await db.update(occupationTable).set(updateFields).where(eq(occupationTable.id, targetId)).execute();

            if (tempFilePath && schemeId && name) {
              const { default: fs } = await import('fs');
              const { default: path } = await import('path');
              const clean = (s: string) => s.toString().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '');
              const cleanName = clean(name);
              const targetDir = path.join(__dirname, `../../../public/uploads/occupations/${targetId}_${schemeId}_${cleanName}`);
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
              const finalPath = path.join(targetDir, `${cleanName}.pdf`);
              try { fs.renameSync(tempFilePath, finalPath); } catch { try { fs.copyFileSync(tempFilePath, finalPath); fs.unlinkSync(tempFilePath); } catch { } }
            }
            break;
          }
          default:
            break;
        }
      };

      const applyDelete = async () => {
        switch (targetTable) {
          case 'user':
            {
              const existingUser = await db.query.user.findFirst({ where: eq(userTable.id, targetId) });
              if (!existingUser) return;
              await db.delete(userTable).where(eq(userTable.id, targetId)).execute();
              const afterDelete = await db.query.user.findFirst({ where: eq(userTable.id, targetId) });
              if (afterDelete) {
                throw new Error('Gagal menghapus user target');
              }
            }
            break;
          case 'occupation': {
            const occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, targetId) });
            if (occupation) {
              const { default: fs } = await import('fs');
              const { default: path } = await import('path');
              const clean = (s: string) => s.toString().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '');
              const cleanName = clean(occupation.name);
              const filePath = path.join(__dirname, `../../../public/uploads/occupations/${occupation.id}_${occupation.scheme_id}_${cleanName}`);
              if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                  fs.rmSync(filePath, { recursive: true, force: true });
                } else if (stat.isFile()) {
                  fs.unlinkSync(filePath);
                }
              }
              await db.delete(occupationTable).where(eq(occupationTable.id, targetId)).execute();
            }
            break;
          }
          case 'scheme': {
            const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, targetId) });
            if (scheme) {
              await db.delete(schemeTable).where(eq(schemeTable.id, targetId)).execute();
            }
            break;
          }
          case 'schedule': {
            const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, targetId) });
            if (schedule) {
              await db.delete(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, targetId)).execute();
              await db.delete(scheduleTable).where(eq(scheduleTable.id, targetId)).execute();
            }
            break;
          }
          case 'assessment': {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, targetId) });
            if (assessment) {
              const schedules = await db.query.assessmentSchedule.findMany({ where: eq(scheduleTable.assessment_id, targetId) });
              for (const schedule of schedules) {
                await db.delete(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, schedule.id)).execute();
              }
              await db.delete(scheduleTable).where(eq(scheduleTable.assessment_id, targetId)).execute();
              await db.delete(assessmentTable).where(eq(assessmentTable.id, targetId)).execute();
            }
            break;
          }
          default:
            break;
        }
      };

      if (action === 'update') {
        await applyUpdate(refreshed.comment as any);
      } else if (action === 'delete') {
        await applyDelete();
      }
    }

    const current = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });

    if (input.decision === 'rejected') {
      await db.update(approvalRequestTable).set({
        status: 'rejected',
        comment: input.comment ?? request.comment,
      }).where(eq(approvalRequestTable.id, input.id)).execute();
    } else {
      if (!current || current.status !== 'approved') {
        await db.update(approvalRequestTable).set({
          status: 'approved',
          comment: input.comment ?? request.comment,
          approved_at: new Date(),
        }).where(eq(approvalRequestTable.id, input.id)).execute();
      }
    }

    const updated = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });
    return updated;
  },
};
