import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import {
  AK02CreateRequest,
  AK02UpdateRequest,
  AK02Response,
} from './ak-02.type';

export class AK02Service {
  static async sendResult(data: AK02CreateRequest): Promise<AK02Response> {
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
          deleteMany: { header_id: headerId },
          create: data.rows.map(row => ({
            uc_id: row.uc_id,
            evidences: {
              create: row.evidences.map(evidence => ({ evidence: evidence }))
            }
          }))
        }
      },
      include: { rows: { include: { uc: true } } }
    });

    return formatAK02Response(ak02Header);
  }

  static async getUnits(resultId: number) {
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        assessment: {
          include: {
            uc_apl02s: true
          }
        },
        ak02_headers: {
          include: {
            rows: {
              include: {
                uc: true,
                evidences: true
              }
            }
          }
        }
      }
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ak02_headers) {
      throw new NotFoundError('Result header');
    }

    return {
      id: result.id,
      units: result.assessment.uc_apl02s.map(unit => {
        const check = result.ak02_headers!.rows.find(row => row.uc_id === unit.id) || null;

        return {
          id: unit.id,
          code: unit.unit_code,
          title: unit.title,
          evidences: check ? check.evidences.map(evidence => evidence.evidence) : null
        }
      })

    }
  }

  static async getResultDetails(resultId: number) {
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        assessment: {
          include: {
            occupation: {
              include: {
                scheme: true
              }
            }
          }
        },
        assessee: {
          include: {
            user: true
          }
        },
        assessor: {
          include: {
            user: true
          }
        },
        ak02_headers: {
          include: {
            rows: {
              include: {
                uc: true,
                evidences: true
              }
            }
          }
        },
      }
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ak02_headers) {
      throw new NotFoundError('Result header');
    }

    return {
      id: result.id,
      assessment: result.assessment,
      assessee: {
        id: result.assessee.id,
        name: result.assessee.user.full_name,
        email: result.assessee.user.email
      },
      assessor: {
        id: result.assessor.id,
        name: result.assessor.user.full_name,
        email: result.assessor.user.email,
        no_reg_met: result.assessor.no_reg_met
      },
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.created_at,
      ak02_headers: {
        id: result.ak02_headers.id,
        is_competent: result.ak02_headers.is_competent,
        follow_up: result.ak02_headers.follow_up,
        comment: result.ak02_headers.comment,
        rows: result.ak02_headers.rows.map(row => ({
          id: row.id,
          unit_id: row.uc_id,
          unit_title: row.uc.title,
          unit_code: row.uc.unit_code,
          evidences: row.evidences.map(evidence => ({ id: evidence.id, evidence: evidence.evidence }))
        }))
      }
    };
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