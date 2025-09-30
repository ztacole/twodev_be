import type { JwtPayload } from "../../auth/auth.type";
import { db } from "../../../config/drizzle";
import { admin as adminTable, resultDoc as resultDocTable, result as resultTable, approvalRequest as approvalRequestTable, user as userTable, occupation as occupationTable } from "../../../../drizzle/schema";
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
    secondApproverAdminId: number;
    targetTable: string;
    targetId: number;
    action: string;
    comment: string | null;
  }) {
    const requester = await db.query.admin.findFirst({ where: eq(adminTable.user_id, input.user.id) });
    if (!requester) throw new Error("Hanya admin yang dapat membuat approval request");

    if (!input.approverAdminId || input.approverAdminId === requester.id) {
      throw new Error("Pilih admin lain sebagai approver pertama");
    }
    if (!input.secondApproverAdminId || input.secondApproverAdminId === requester.id || input.secondApproverAdminId === input.approverAdminId) {
      throw new Error("Pilih admin lain (berbeda) sebagai approver kedua");
    }

    await db.insert(approvalRequestTable).values({
      requester_admin_id: requester.id,
      approver_admin_id: input.approverAdminId,
      second_approver_admin_id: input.secondApproverAdminId,
      target_table: input.targetTable,
      target_id: input.targetId,
      action: input.action,
      status: 'pending',
      comment: input.comment ?? null,
      approved_at: null as any,
      approved_by_first_at: null as any,
      approved_by_second_at: null as any,
    }).execute();

    const created = await db.query.approvalRequest.findFirst({
      where: (tbl, { eq, and }) => and(
        eq(tbl.requester_admin_id, requester.id),
        eq(tbl.approver_admin_id, input.approverAdminId),
        eq(tbl.second_approver_admin_id, input.secondApproverAdminId),
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
        where: (tbl, { or, and, eq: _eq, not: _not }) => or(
          and(_eq(tbl.approver_admin_id, admin.id), _eq(tbl.status, 'pending'), _eq(tbl.approved_by_first, false)),
          and(_eq(tbl.second_approver_admin_id, admin.id), _eq(tbl.status, 'pending'), _eq(tbl.approved_by_second, false))
        ),
        orderBy: (tbl, { desc }) => desc(tbl.created_at),
      });
    }

    return await db.query.approvalRequest.findMany({
      where: (tbl, { or, eq: _eq }) => or(
        _eq(tbl.requester_admin_id, admin.id),
        _eq(tbl.approver_admin_id, admin.id),
        _eq(tbl.second_approver_admin_id, admin.id)
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
    const isSecondApprover = request.second_approver_admin_id === admin.id;
    if (!isFirstApprover && !isSecondApprover) throw new Error("Anda bukan approver untuk request ini");

    if (input.decision === 'approved') {
      if (isFirstApprover && !request.approved_by_first) {
        await db.update(approvalRequestTable).set({
          approved_by_first: true,
          approved_by_first_at: new Date(),
          comment: input.comment ?? request.comment,
        }).where(eq(approvalRequestTable.id, input.id)).execute();
      }
      if (isSecondApprover && !request.approved_by_second) {
        await db.update(approvalRequestTable).set({
          approved_by_second: true,
          approved_by_second_at: new Date(),
          comment: input.comment ?? request.comment,
        }).where(eq(approvalRequestTable.id, input.id)).execute();
      }

      const refreshed = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });
      if (!refreshed) throw new Error("Approval request tidak ditemukan setelah update");

      const bothApproved = Boolean(refreshed.approved_by_first) && Boolean(refreshed.approved_by_second);
      if (!bothApproved) {
        await db.update(approvalRequestTable).set({ status: 'pending' }).where(eq(approvalRequestTable.id, input.id)).execute();
        return await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });
      }

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
            // Move uploaded temp file to final location if present in comment JSON
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
            await db.delete(userTable).where(eq(userTable.id, targetId)).execute();
            break;
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
    const bothApprovedNow = current && current.approved_by_first && current.approved_by_second;

    if (input.decision === 'rejected') {
      await db.update(approvalRequestTable).set({
        status: 'rejected',
        comment: input.comment ?? request.comment,
      }).where(eq(approvalRequestTable.id, input.id)).execute();
    } else if (bothApprovedNow) {
      await db.update(approvalRequestTable).set({
        status: 'approved',
        comment: input.comment ?? request.comment,
        approved_at: new Date(),
      }).where(eq(approvalRequestTable.id, input.id)).execute();
    } else {
      await db.update(approvalRequestTable).set({ status: 'pending' }).where(eq(approvalRequestTable.id, input.id)).execute();
    }

    const updated = await db.query.approvalRequest.findFirst({ where: eq(approvalRequestTable.id, input.id) });
    return updated;
  },
};
