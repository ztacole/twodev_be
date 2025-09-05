import { db } from '../../config/drizzle';
import ExcelJS from 'exceljs';
import { SchemeRequest } from './scheme.type';
import { DuplicateEntryError, NotFoundError } from '../../common/error';
import { scheme as schemeTable } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class SchemeService {
  public static getSchemes = async (): Promise<any> => {
    return db.select().from(schemeTable);
  };

  public static getSchemeById = async (id: number): Promise<any> => {
    const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, id) });

    if (!scheme) {
      throw new NotFoundError('Scheme');
    }

    return scheme;
  };

  public static createScheme = async (data: SchemeRequest) => {
    const existingSchemeCode = await db.query.scheme.findFirst({ where: eq(schemeTable.code, data.code) });
    if (existingSchemeCode) {
      throw new DuplicateEntryError('Scheme code', data.code);
    }

    await db.insert(schemeTable).values({ code: data.code, name: data.name });
    return await db.query.scheme.findFirst({ where: eq(schemeTable.code, data.code) });
  };

  public static updateScheme = async (id: number, data: SchemeRequest) => {
    const existingScheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, id) });
    if (!existingScheme) {
      throw new NotFoundError('Scheme');
    }

    const existingSchemeCode = await db.query.scheme.findFirst({ where: eq(schemeTable.code, data.code) });
    if (existingSchemeCode && existingSchemeCode.id !== id) {
      throw new DuplicateEntryError('Scheme code', data.code);
    }

    await db.update(schemeTable).set({ code: data.code, name: data.name }).where(eq(schemeTable.id, id));

    const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, id) });

    return scheme;
  };

  public static deleteScheme = async (id: number) => {
    const existingScheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, id) });
    if (!existingScheme) {
      throw new NotFoundError('Scheme');
    }

    await db.delete(schemeTable).where(eq(schemeTable.id, id));
  };

  public static exportSchemesToExcel = async () => {
    const schemes = await db.select().from(schemeTable);

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
