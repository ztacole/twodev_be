import { prisma } from '../../config/db';
import ExcelJS from 'exceljs';

export const getOccupations = async () => {
    return prisma.occupation.findMany({
        include: {
            scheme: true
        }
    });
};

export const getOccupationById = async (id: number) => {
    return prisma.occupation.findUnique({
        where: { id },
        include: {
            scheme: true
        }
    });
};

export const createOccupation = async (data: any) => {
    return prisma.occupation.create({ data });
};

export const updateOccupation = async (id: number, data: any) => {
    return prisma.occupation.update({ where: { id }, data });
};

export const deleteOccupation = async (id: number) => {
    return prisma.occupation.delete({ where: { id } });
};

export const exportOccupationsToExcel = async () => {
    const occupations = await prisma.occupation.findMany({
        include: { scheme: true }
    });

    if (!occupations.length) {
        throw new Error('Tidak ada data okupasi untuk diekspor');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Occupations');

    const headerRow = worksheet.addRow(['Nama Jurusan', 'Okupasi']);
    headerRow.eachCell((cell: any) => {
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

    occupations.forEach(occ => {
        const row = worksheet.addRow([
            occ.scheme?.code || '',
            occ.name
        ]);
        row.eachCell((cell: any) => {
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
        { width: 40 }  // Okupasi
    ];

    return await workbook.xlsx.writeBuffer();
};