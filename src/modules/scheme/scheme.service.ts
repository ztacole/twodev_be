import { prisma } from '../../config/db';
import * as XLSX from 'xlsx';
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
  
  const formattedData = schemes.map(scheme => ({
    'Nama Jurusan': scheme.code,
    'Deskripsi': scheme.name
  }));
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schemes');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
};

