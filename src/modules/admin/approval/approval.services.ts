import { PrismaClient } from "@prisma/client";
import type { JwtPayload } from "../../auth/auth.type";

const prisma = new PrismaClient();

export const ApprovalService = {
  async approveApl01Document(docId: number, user: JwtPayload): Promise<any> {
    const admin = await prisma.admin.findUnique({
      where: { user_id: user.userId },
    });

    if (!admin) {
      throw new Error("Hanya admin yang dapat melakukan approval dokumen APL-01");
    }

    const resultDoc = await prisma.result_doc.update({
      where: { id: docId },
      data: { approved: true },
    });

    return resultDoc;
  },

  async approveCompetency(resultId: number, user: JwtPayload): Promise<void> {
    if (user.role_id !== 1) {
      throw new Error("Hanya admin yang dapat melakukan approval kompetensi");
    }

    await prisma.result.update({
      where: { id: resultId },
      data: { is_competent: true },
    });
  },
};
