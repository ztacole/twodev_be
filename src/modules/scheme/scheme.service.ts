import { prisma } from '../../config/db';
import ExcelJS from 'exceljs';
import { SchemeRequest } from './scheme.type';
import { DuplicateEntryError, NotFoundError } from '../../common/error';

export class SchemeService {
  public static getSchemes = async (): Promise<any> => {
    return prisma.schemes.findMany();
  };

  public static getSchemeById = async (id: number): Promise<any> => {
    const scheme = await prisma.schemes.findUnique({ where: { id } });

    if (!scheme) {
      throw new NotFoundError('Scheme');
    }

    return scheme;
  };

  public static createScheme = async (data: SchemeRequest) => {
    const existingSchemeCode = await prisma.schemes.findFirst({ where: { code: data.code } });
    if (existingSchemeCode) {
      throw new DuplicateEntryError('Scheme code', data.code);
    }

    const existingSchemeName = await prisma.schemes.findFirst({ where: { name: data.name } });
    if (existingSchemeName) {
      throw new DuplicateEntryError('Scheme name', data.name);
    }

    return prisma.schemes.create({ data });
  };

  public static updateScheme = async (id: number, data: SchemeRequest) => {
    const existingScheme = await prisma.schemes.findUnique({ where: { id } });
    if (!existingScheme) {
      throw new NotFoundError('Scheme');
    }

    const existingSchemeCode = await prisma.schemes.findFirst({ where: { code: data.code } });
    if (existingSchemeCode) {
      throw new DuplicateEntryError('Scheme code', data.code);
    }

    const existingSchemeName = await prisma.schemes.findFirst({ where: { name: data.name } });
    if (existingSchemeName) {
      throw new DuplicateEntryError('Scheme name', data.name);
    }

    const scheme = prisma.schemes.update({ where: { id }, data });

    if (!scheme) {
      throw new NotFoundError('Scheme');
    }

    return scheme;
  };

  public static deleteScheme = async (id: number) => {
    const existingScheme = await prisma.schemes.findUnique({ where: { id } });
    if (!existingScheme) {
      throw new NotFoundError('Scheme');
    }

    return await prisma.schemes.delete({ where: { id: id } });
  };

  public static exportSchemesToExcel = async () => {
    const schemes = await prisma.schemes.findMany();

    if (!schemes.length) {
      throw new NotFoundError('Schemes');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schemes');

    const headerRow = worksheet.addRow(['Nama Jurusan', 'Deskripsi']);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE77D35' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    schemes.forEach(scheme => {
      const row = worksheet.addRow([scheme.code, scheme.name]);
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    worksheet.columns = [
      { width: 25 }, // Nama Jurusan
      { width: 50 }  // Deskripsi
    ];

    return await workbook.xlsx.writeBuffer();
  };
}
