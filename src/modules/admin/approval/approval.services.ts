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

    const result = await prisma.result.update({
      where: { id: resultDoc.result_id },
      data: {
        apl02_headers: { 
          create: {
            approved_assessee: false,
            approved_assessor: false,
            is_continue: false
          }
        },
        ia01_headers: { 
          create: {
            approved_assessee: false,
            approved_assessor: false,
            is_competent: false
          }
        },
        ia02_headers: {
          create: {
            approved_assessee: false,
            approved_assessor: false,
          }
        },
        ia03_headers: {
          create: {
            approved_assessee: false,
            approved_assessor: false,
          }
        },
        ia05_headers: {
          create: {
            approved_assessee: false,
            approved_assessor: false,
          }
        },
        ia07_headers: {
          create: {
            approved_assessee: false,
            approved_assessor: false,
          }
        },
        ak01_headers: {
          create: {
            approved_assessee: false,
            approved_assessor: false,
          }
        },
        ak02_headers: {
          create: {
            approved_assessee: false,
            approved_assessor: false,
            is_competent: false
          }
        }
      },
      include: {
        apl02_headers: true,
        ia01_headers: true,
        ia02_headers: true,
        ia03_headers: true,
        ia05_headers: true,
        ia07_headers: true,
        ak01_headers: true,
        ak02_headers: true
      }
    });

    return result;
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
