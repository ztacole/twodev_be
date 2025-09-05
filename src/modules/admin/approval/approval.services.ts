import type { JwtPayload } from "../../auth/auth.type";
import { db } from "../../../config/drizzle";
import { admin as adminTable, resultDoc as resultDocTable, result as resultTable } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const ApprovalService = {
  async approveApl01Document(docId: number, user: JwtPayload): Promise<any> {
    const admin = await db.query.admin.findFirst({
      where: eq(adminTable.userId, user.userId),
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

    await db.update(resultTable).set({ isCompetent: true }).where(eq(resultTable.id, resultId));
  },
};
