import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { 
  AK01CreateRequest, 
  AK01UpdateRequest, 
  AK01Response,
} from './ak-01.type';

export class AK01Service {
  static async createAK01(data: AK01CreateRequest): Promise<AK01Response> {
    const { result_id, evidences } = data;
  
    const result = await prisma.result.findUnique({
      where: { id: result_id },
      include: { ak01_headers: true },
    });
  
    if (!result) {
      throw new NotFoundError('Result');
    }
  
    const header = result.ak01_headers;
  
    if (!header) {
      throw new NotFoundError('Header AK01');
    }
  
    const updatedHeader = await prisma.result_ak01_header.update({
      where: { id: header.id },
      data: {
        rows: {
          deleteMany: {},
          create: evidences.map(evidence => ({ evidence })),
        },
      },
      include: { rows: true },
    });
  
    return formatAK01Response(updatedHeader);
  }

  static async getDataForAK01(resultId: number): Promise<any> {
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: { 
        ak01_headers: {
          include: {
            rows: true
          }
        },
        assessment: {
          include: {
            occupation: {
              include: {
                scheme: true
              }
            },
            assessment_schedules: {
              include: {
                schedule_details: true
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
        }
      },
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ak01_headers) {
      throw new NotFoundError('Header AK01');
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
      locations: result.assessment.assessment_schedules.flatMap(schedule => schedule.schedule_details.filter(detail => detail.assessor_id === result.assessor_id).map(detail => detail.location)),
      ak01_header: result.ak01_headers
    };
  }
  
  static async getAK01ById(id: number): Promise<AK01Response> {
    const ak01Header = await prisma.result_ak01_header.findUnique({
      where: { id },
      include: {
        rows: true
      }
    });
  
    if (!ak01Header) {
      throw new NotFoundError('Header AK01');
    }
  
    return formatAK01Response(ak01Header);
  }
  
  static async getAK01ByResultId(resultId: number): Promise<AK01Response> {
    const ak01Header = await prisma.result_ak01_header.findFirst({
      where: { result_id: resultId },
      include: {
        rows: true
      }
    });
  
    if (!ak01Header) {
      throw new NotFoundError('Header AK01');
    }
  
    return formatAK01Response(ak01Header);
  }
  
  static async updateAK01(id: number, data: AK01UpdateRequest): Promise<AK01Response> {
    const existingHeader = await prisma.result_ak01_header.findUnique({ where: { id } });

    if (!existingHeader) {
      throw new NotFoundError('Header AK01');
    }

    const updateData: any = {};

    if (data.evidences) {
      updateData.rows = {
        deleteMany: {},
        create: data.evidences.map(evidence => ({ evidence })),
      };
    }

    const ak01Header = await prisma.result_ak01_header.update({
      where: { id },
      data: updateData,
      include: { rows: true },
    });

    return formatAK01Response(ak01Header);
  }
  
  static async deleteAK01(id: number): Promise<void> {
    const existingHeader = await prisma.result_ak01_header.findUnique({ where: { id } });

    if (!existingHeader) {
      throw new NotFoundError('Header AK01');
    }

    await prisma.result_ak01_header.delete({ where: { id } });
  }

  // AK-O1 Approval
  static async approvedByAssessor(resultId: number) {
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        ak01_headers: true,
      },
    });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    if (!existingResult.ak01_headers) {
      throw new NotFoundError('AK01 header');
    }

    const update = await prisma.result_ak01_header.update({
      where: { id: existingResult.ak01_headers.id },
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
        ak01_headers: true,
      },
    });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    if (!existingResult.ak01_headers) {
      throw new NotFoundError('AK01 header');
    }

    const update = await prisma.result_ak01_header.update({
      where: { id: existingResult.ak01_headers.id },
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
function formatAK01Response(ak01Header: any): AK01Response {
  return {
    id: ak01Header.id,
    result_id: ak01Header.result_id,
    approved_assessee: ak01Header.approved_assessee,
    approved_assessor: ak01Header.approved_assessor,
    rows: ak01Header.rows.map((row: any) => ({
      id: row.id,
      header_id: row.header_id,
      evidence: row.evidence
    }))
  };
}

function formatApproval(result: any) {
  return {
    id: result.id,
    result_id: result.result_id,
    assessee: {
      id: result.result.assessee.id,
      name: result.result.assessee.user.full_name,
      email: result.result.assessee.user.email,
    },
    approved_assessee: result.approved_assessee,
    approved_assessor: result.approved_assessor,
  };
}