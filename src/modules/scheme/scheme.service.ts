import { prisma } from '../../config/db';
import ExcelJS from 'exceljs';
import { Writable } from 'stream';

export const getSchemes = async () => {
  return prisma.schemes.findMany();
};

export const getSchemeById = async (id: number) => {
  return prisma.schemes.findUnique({ where: { id } });
};

export const createScheme = async (data: any) => {
  return prisma.schemes.create({ data });
};

export const updateScheme = async (id: number, data: any) => {
  return prisma.schemes.update({ where: { id }, data });
};

export const deleteScheme = async (id: number) => {
  return prisma.schemes.delete({ where: { id } });
};

export const exportSchemesToExcel = async () => {
  const schemes = await prisma.schemes.findMany();

  if (!schemes.length) {
    throw new Error('Tidak ada data scheme untuk diekspor');
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

