import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { 
  AK01CreateRequest, 
  AK01UpdateRequest, 
  AK01Response, 
  AK02CreateRequest, 
  AK02UpdateRequest, 
  AK02Response,
  AKListResponse
} from './ak.type';

export class AKService {
  // AK01 Methods
  
  static async createAK01(data: AK01CreateRequest): Promise<AK01Response> {
    const result = await prisma.result.findUnique({
      where: { id: data.result_id }
    });

    if (!result) {
      throw new NotFoundError('Result');
    }

    const existingHeader = await prisma.result_ak01_header.findFirst({
      where: { result_id: data.result_id }
    });

    if (existingHeader) {
      throw new DuplicateEntryError('Header AK01', `result_id: ${data.result_id}`);
    }

    const ak01Header = await prisma.result_ak01_header.create({
      data: {
        result_id: data.result_id,
        approved_assessee: data.approved_assessee,
        approved_assessor: data.approved_assessor,
        rows: {
          create: data.evidences.map(evidence => ({
            evidence
          }))
        }
      },
      include: {
        rows: true
      }
    });

    return formatAK01Response(ak01Header);
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
    const existingHeader = await prisma.result_ak01_header.findUnique({
      where: { id }
    });

    if (!existingHeader) {
      throw new NotFoundError('Header AK01');
    }

    const updateData: any = {};
    
    if (data.approved_assessee !== undefined) {
      updateData.approved_assessee = data.approved_assessee;
    }
    
    if (data.approved_assessor !== undefined) {
      updateData.approved_assessor = data.approved_assessor;
    }

    if (data.evidences) {
      updateData.rows = {
        deleteMany: {},
        create: data.evidences.map(evidence => ({
          evidence
        }))
      };
    }

    const ak01Header = await prisma.result_ak01_header.update({
      where: { id },
      data: updateData,
      include: {
        rows: true
      }
    });

    return formatAK01Response(ak01Header);
  }

  static async deleteAK01(id: number): Promise<void> {
    const existingHeader = await prisma.result_ak01_header.findUnique({
      where: { id }
    });

    if (!existingHeader) {
      throw new NotFoundError('Header AK01');
    }

    await prisma.result_ak01_header.delete({
      where: { id }
    });
  }

  // AK02 Methods

  static async createAK02(data: AK02CreateRequest): Promise<AK02Response> {
    const result = await prisma.result.findUnique({
      where: { id: data.result_id }
    });

    if (!result) {
      throw new NotFoundError('Result');
    }

    const existingHeader = await prisma.result_ak02_header.findFirst({
      where: { result_id: data.result_id }
    });

    if (existingHeader) {
      throw new DuplicateEntryError('Header AK02', `result_id: ${data.result_id}`);
    }

    const ucIds = data.rows.map(row => row.uc_id);
    const existingUCs = await prisma.uc_apl02.findMany({
      where: { id: { in: ucIds } }
    });

    if (existingUCs.length !== ucIds.length) {
      throw new NotFoundError('Satu atau lebih Unit Kompetensi');
    }

    const ak02Header = await prisma.result_ak02_header.create({
      data: {
        result_id: data.result_id,
        approved_assessee: data.approved_assessee,
        approved_assessor: data.approved_assessor,
        is_competent: data.is_competent,
        follow_up: data.follow_up,
        comment: data.comment,
        rows: {
          create: data.rows.map(row => ({
            uc_id: row.uc_id,
            evidence: row.evidence
          }))
        }
      },
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
    
    if (data.approved_assessee !== undefined) {
      updateData.approved_assessee = data.approved_assessee;
    }
    
    if (data.approved_assessor !== undefined) {
      updateData.approved_assessor = data.approved_assessor;
    }

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

  // Combined Methods

  static async getAKByResultId(resultId: number): Promise<AKListResponse> {
    const [ak01Headers, ak02Headers] = await Promise.all([
      prisma.result_ak01_header.findMany({
        where: { result_id: resultId },
        include: {
          rows: true
        }
      }),
      prisma.result_ak02_header.findMany({
        where: { result_id: resultId },
        include: {
          rows: {
            include: {
              uc: true
            }
          }
        }
      })
    ]);

    return {
      ak01: ak01Headers.map(formatAK01Response),
      ak02: ak02Headers.map(formatAK02Response)
    };
  }

  static async getAllAK(): Promise<AKListResponse> {
    const [ak01Headers, ak02Headers] = await Promise.all([
      prisma.result_ak01_header.findMany({
        include: {
          rows: true
        }
      }),
      prisma.result_ak02_header.findMany({
        include: {
          rows: {
            include: {
              uc: true
            }
          }
        }
      })
    ]);

    return {
      ak01: ak01Headers.map(formatAK01Response),
      ak02: ak02Headers.map(formatAK02Response)
    };
  }
}

// Helper Functions

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