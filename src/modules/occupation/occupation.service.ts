import { prisma } from '../../config/db';
import * as XLSX from 'xlsx';

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
        include: {
            scheme: true
        }
    });
    
    const formattedData = occupations.map(occupation => ({
        'Nama Jurusan': occupation.scheme.code,
        'Okupasi': occupation.name
    }));
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Occupations');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
};