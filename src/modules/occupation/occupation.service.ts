import { db } from '../../config/drizzle';
import ExcelJS from 'exceljs';
import { OccupationRequest, OccupationResponse } from './occupation.type';
import { DuplicateEntryError, NotFoundError } from '../../common/error';
import { occupation as occupationTable, scheme as schemeTable } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class OccupationService {
    static async getOccupations(): Promise<OccupationResponse[]> {
        const occupations = await db.select().from(occupationTable);
        const schemeIds = [...new Set(occupations.map(o => o.scheme_id))];
        const schemes = schemeIds.length ? await db.select().from(schemeTable).where(eq(schemeTable.id, schemeIds[0])) : [];
        const schemeById = new Map(schemes.map(s => [s.id, s]));
        return occupations.map(o => ({
            ...o,
            scheme: schemeById.get(o.scheme_id) || null,
        }) as any);
    }

    static async getOccupationById(id: number): Promise<OccupationResponse> {
        const occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, id) });
        if (!occupation) {
            throw new NotFoundError('Occupation');
        }
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) });
        return { ...occupation, scheme } as any;
    }

    static async createOccupation(data: OccupationRequest) {
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, data.scheme_id) });
        if (!scheme) {
            throw new NotFoundError('Scheme');
        }

        const existingOccupation = await db.query.occupation.findFirst({
            where: and(eq(occupationTable.scheme_id, data.scheme_id), eq(occupationTable.name, data.name)),
        });
        if (existingOccupation) {
            throw new DuplicateEntryError('Occupation name', data.name);
        }

        await db.insert(occupationTable).values({ scheme_id: data.scheme_id, name: data.name });
        return await db.query.occupation.findFirst({ where: and(eq(occupationTable.scheme_id, data.scheme_id), eq(occupationTable.name, data.name)) });
    }

    static async updateOccupation(id: number, data: OccupationRequest) {
        const existingOccupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, id) });
        if (!existingOccupation) {
            throw new NotFoundError('Occupation');
        }
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, data.scheme_id) });
        if (!scheme) {
            throw new NotFoundError('Scheme');
        }

        const existingOccupationName = await db.query.occupation.findFirst({ where: eq(occupationTable.name, data.name) });
        if (existingOccupationName && existingOccupationName.id !== id) {
            throw new DuplicateEntryError('Occupation name', data.name);
        }

        await db.update(occupationTable)
            .set({ scheme_id: data.scheme_id, name: data.name })
            .where(eq(occupationTable.id, id));

        const occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, id) });
        if (!occupation) {
            throw new NotFoundError('Occupation');
        }
        return occupation;
    }

    static async deleteOccupation(id: number) {
        const existingOccupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, id) });
        if (!existingOccupation) {
            throw new NotFoundError('Occupation');
        }

        await db.delete(occupationTable).where(eq(occupationTable.id, id));
    }

    static async exportOccupationsToExcel() {
        const occupations = await db.select().from(occupationTable);
        if (!occupations.length) {
            throw new NotFoundError('Occupations');
        }
        const scheme_ids = [...new Set(occupations.map(o => o.scheme_id))];
        const schemes = scheme_ids.length ? await db.select().from(schemeTable).where(eq(schemeTable.id, scheme_ids[0])) : [];
        const schemeById = new Map(schemes.map(s => [s.id, s]));

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
                schemeById.get(occ.scheme_id)?.code || '',
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