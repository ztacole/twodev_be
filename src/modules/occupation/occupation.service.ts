import { db } from '../../config/drizzle';
import ExcelJS from 'exceljs';
import { OccupationRequest, OccupationResponse } from './occupation.type';
import { AppError, DuplicateEntryError, NotFoundError } from '../../common/error';
import { occupation as occupationTable, scheme as schemeTable } from '../../../drizzle/schema';
import { and, asc, desc, eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import { cleanString } from '../../helper/string';

export class OccupationService {
    static async getOccupations(schemeId?: number): Promise<OccupationResponse[]> {
        const occupations = await db.select({
            id: occupationTable.id,
            scheme_id: occupationTable.scheme_id,
            name: occupationTable.name,
            created_at: occupationTable.created_at,
            updated_at: occupationTable.updated_at,
            scheme: schemeTable
        }).from(occupationTable)
            .leftJoin(schemeTable, eq(occupationTable.scheme_id, schemeTable.id))
            .where(schemeId ? eq(occupationTable.scheme_id, schemeId) : undefined)
            .orderBy(asc(schemeTable.name));

        for (const occ of occupations) {
            let status = false;
            const cleanName = cleanString(occ.name);
            const filePath = path.join(__dirname, `../../../public/uploads/occupations/${occ.id}_${occ.scheme_id}_${cleanName}/${cleanName}.pdf`);
            if (fs.existsSync(filePath)) status = true;
            (occ as any).uploaded_file = status;
        }

        return occupations as any;
    }

    static async getOccupationById(id: number): Promise<OccupationResponse> {
        const [occupation] = await db.select({
            id: occupationTable.id,
            scheme_id: occupationTable.scheme_id,
            name: occupationTable.name,
            created_at: occupationTable.created_at,
            updated_at: occupationTable.updated_at,
            scheme: schemeTable
        }).from(occupationTable)
            .leftJoin(schemeTable, eq(occupationTable.scheme_id, schemeTable.id))
            .where(eq(occupationTable.id, id));
        if (!occupation) {
            throw new NotFoundError('Occupation');
        }

        let status = false;
        const cleanName = cleanString(occupation.name);
        const filePath = path.join(__dirname, `../../../public/uploads/occupations/${occupation.id}_${occupation.scheme_id}_${cleanName}/${cleanName}.pdf`);
        if (fs.existsSync(filePath)) status = true;
        (occupation as any).uploaded_file = status;

        return occupation as any;
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
        try {
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
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async deleteOccupation(id: number, schemeId: number, name: string) {
        const filePath = path.join(__dirname, `../../../public/uploads/occupations/${id}_${schemeId}_${name}`);
        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else if (stat.isFile()) {
                fs.unlinkSync(filePath);
            }
        }
        
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

    static async getUploadedPdf(id: number, schemaId: number, name: string) {
        const filePath = path.join(__dirname, `../../../public/uploads/occupations/${id}_${schemaId}_${name}/${name}.pdf`);
        if (!fs.existsSync(filePath)) {
            throw new AppError(`File PDF tidak ditemukan di server`, 404);
        }
        const fileBuffer = await fs.promises.readFile(filePath);
        return fileBuffer;
    }
}