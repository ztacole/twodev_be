import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { 
  AK01CreateRequest, 
  AK01UpdateRequest, 
  AK01Response,
} from './ak-01.type';

export class AK01Service {
  static async createAK01(data: AK01CreateRequest): Promise<AK01Response> {
      const result = await prisma.result.findUnique({ where: { id: data.result_id }, include: { ak01_headers: true } });
      if (!result) {
        throw new NotFoundError('Result');
      }
      if (!result.ak01_headers) {
        throw new NotFoundError('Header AK01');
      }
  
      const headerId = result.ak01_headers.id;
  
      const ak01Header = await prisma.result_ak01_header.update({
        where: { id: headerId },
        data: {
          approved_assessee: data.approved_assessee,
          approved_assessor: data.approved_assessor,
          rows: {
            deleteMany: {},
            create: data.evidences.map(evidence => ({ evidence }))
          }
        },
        include: { rows: true }
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