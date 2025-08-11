import { prisma } from '../../config/db';
import ExcelJS from 'exceljs';
import { OccupationResponse } from '../assessement/apl2/apl2.type';
import { OccupationRequest } from './occupation.type';
import { DuplicateEntryError, NotFoundError } from '../../common/error';

export class OccupationService {
    static async getOccupations(): Promise<OccupationResponse[]> {
        return prisma.occupation.findMany({
            include: {
                scheme: true
            }
        });
    }

    static async getOccupationById(id: number): Promise<OccupationResponse> {
        const occupation = await prisma.occupation.findUnique({
            where: { id },
            include: {
                scheme: true
            }
        });

        if (!occupation) {
            throw new NotFoundError('Occupation');
        }

        return occupation;
    }

    static async createOccupation(data: OccupationRequest) {
        const scheme = await prisma.schemes.findFirst({
            where: {
                id: data.scheme_id
            }
        });
        if (!scheme) {
            throw new NotFoundError('Scheme');
        }

        const existingOccupation = await prisma.occupation.findFirst({
            where: {
                name: data.name
            }
        });
        if (existingOccupation) {
            throw new DuplicateEntryError('Occupation name', data.name);
        }

        return prisma.occupation.create({ data });
    }

    static async updateOccupation(id: number, data: OccupationRequest) {
        const existingOccupation = await prisma.occupation.findUnique({ where: { id } });
        if (!existingOccupation) {
            throw new NotFoundError('Occupation');
        }
        
        const scheme = await prisma.schemes.findFirst({
            where: {
                id: data.scheme_id
            }
        });
        if (!scheme) {
            throw new NotFoundError('Scheme');
        }

        const existingOccupationName = await prisma.occupation.findFirst({
            where: {
                name: data.name
            }
        });
        if (existingOccupationName) {
            throw new DuplicateEntryError('Occupation name', data.name);
        }

        const occupation = await prisma.occupation.update({ where: { id }, data });

        if (!occupation) {
            throw new NotFoundError('Occupation');
        }

        return occupation;
    }

    static async deleteOccupation(id: number) {
        const existingOccupation = await prisma.occupation.findUnique({ where: { id } });
        if (!existingOccupation) {
            throw new NotFoundError('Occupation');
        }

        return await prisma.occupation.delete({ where: { id } });
    }

    static async exportOccupationsToExcel() {
        const occupations = await prisma.occupation.findMany({
            include: { scheme: true }
        });

        if (!occupations.length) {
            throw new NotFoundError('Occupations');
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
    }
}