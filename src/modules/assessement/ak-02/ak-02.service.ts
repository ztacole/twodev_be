import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import {  
  AK02CreateRequest, 
  AK02UpdateRequest, 
  AK02Response,
} from './ak-02.type';

export class AK02Service {
  static async createAK02(data: AK02CreateRequest): Promise<AK02Response> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id }, include: { ak02_headers: true } });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ak02_headers) {
      throw new NotFoundError('Header AK02');
    }

    const ucIds = data.rows.map(row => row.uc_id);
    const existingUCs = await prisma.uc_apl02.findMany({ where: { id: { in: ucIds } } });
    if (existingUCs.length !== ucIds.length) {
      throw new NotFoundError('Satu atau lebih Unit Kompetensi');
    }

    const headerId = result.ak02_headers.id;

    const ak02Header = await prisma.result_ak02_header.update({
      where: { id: headerId },
      data: {
        is_competent: data.is_competent,
        follow_up: data.follow_up,
        comment: data.comment,
        rows: {
          deleteMany: {},
          create: data.rows.map(row => ({ uc_id: row.uc_id, evidence: row.evidence }))
        }
      },
      include: { rows: { include: { uc: true } } }
    });

    return formatAK02Response(ak02Header);
  }

  static async getAK02ById(id: number): Promise<AK02Response> {
    const ak02Header = await prisma.result_ak02_header.findUnique({
      where: { id },
      include: {
        rows: {
          include: {
            uc: true
          }
        }
      }
    });

    if (!ak02Header) {
      throw new NotFoundError('Header AK02');
    }

    return formatAK02Response(ak02Header);
  }

  static async getAK02ByResultId(resultId: number): Promise<AK02Response> {
    const ak02Header = await prisma.result_ak02_header.findFirst({
      where: { result_id: resultId },
      include: {
        rows: {
          include: {
            uc: true
          }
        }
      }
    });

    if (!ak02Header) {
      throw new NotFoundError('AK02 header');
    }

    return formatAK02Response(ak02Header);
  }

  static async updateAK02(id: number, data: AK02UpdateRequest): Promise<AK02Response> {
    const existingHeader = await prisma.result_ak02_header.findUnique({
      where: { id }
    });

    if (!existingHeader) {
      throw new NotFoundError('Header AK02');
    }

    const updateData: any = {};

    if (data.is_competent !== undefined) {
      updateData.is_competent = data.is_competent;
    }

    if (data.follow_up !== undefined) {
      updateData.follow_up = data.follow_up;
    }

    if (data.comment !== undefined) {
      updateData.comment = data.comment;
    }

    if (data.rows) {
      const ucIds = data.rows.map(row => row.uc_id);
      const existingUCs = await prisma.uc_apl02.findMany({
        where: { id: { in: ucIds } }
      });

      if (existingUCs.length !== ucIds.length) {
        throw new NotFoundError('One or more Unit Competencies');
      }

      updateData.rows = {
        deleteMany: {},
        create: data.rows.map(row => ({
          uc_id: row.uc_id,
          evidence: row.evidence
        }))
      };
    }

    const ak02Header = await prisma.result_ak02_header.update({
      where: { id },
      data: updateData,
      include: {
        rows: {
          include: {
            uc: true
          }
        }
      }
    });

    return formatAK02Response(ak02Header);
  }

  static async deleteAK02(id: number): Promise<void> {
    const existingHeader = await prisma.result_ak02_header.findUnique({
      where: { id }
    });

    if (!existingHeader) {
      throw new NotFoundError('AK02 header');
    }

    await prisma.result_ak02_header.delete({
      where: { id }
    });
  }

  // AK-02 Approval
  static async approvedByAssessor(resultId: number) {
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        ak02_headers: true,
      },
    });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    if (!existingResult.ak02_headers) {
      throw new NotFoundError('AK02 header');
    }

    const update = await prisma.result_ak02_header.update({
      where: { id: existingResult.ak02_headers.id },
      data: { approved_assessor: true },
      include: {
        result: {
          include: {
            assessee: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return formatApproval(update);
  }

  static async approvedByAssessee(resultId: number) {
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        ak02_headers: true,
      },
    });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    if (!existingResult.ak02_headers) {
      throw new NotFoundError('AK02 header');
    }

    const update = await prisma.result_ak02_header.update({
      where: { id: existingResult.ak02_headers.id },
      data: { approved_assessee: true },
      include: {
        result: {
          include: {
            assessee: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return formatApproval(update);
  }
}

// Helpers

function formatAK02Response(ak02Header: any): AK02Response {
  return {
    id: ak02Header.id,
    result_id: ak02Header.result_id,
    approved_assessee: ak02Header.approved_assessee,
    approved_assessor: ak02Header.approved_assessor,
    is_competent: ak02Header.is_competent,
    follow_up: ak02Header.follow_up,
    comment: ak02Header.comment,
    rows: ak02Header.rows.map((row: any) => ({
      id: row.id,
      header_id: row.header_id,
      uc_id: row.uc_id,
      evidence: row.evidence,
      uc: {
        id: row.uc.id,
        unit_code: row.uc.unit_code,
        title: row.uc.title
      }
    }))
  };
}

function formatApproval(result: any) {
  return {
    id: result.id,
    result_id: result.result_id,
    assessee: {
      id: result.assessee.id,
      name: result.assessee.user.full_name,
      email: result.assessee.user.email,
    },
    approved_assessee: result.approved_assessee,
    approved_assessor: result.approved_assessor,
  };
}