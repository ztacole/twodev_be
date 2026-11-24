import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssesseeResponse, AssesseeRequest } from './asseessee.type';
import ExcelJS from 'exceljs';
import {
    assessee as assesseeTable,
    user as userTable,
    role as roleTable,
    assesseeJob,
    result as resultTable,
    assessmentSchedule as assessmentScheduleTable,
    assessment as assessmentTable,
    occupation as occupationTable,
    scheme as schemeTable
} from '../../../drizzle/schema';
import { eq, like, or, sql, and } from 'drizzle-orm';
import { PagingMeta } from '../../helper/type';

const translateGenderToEn = (gender: string): 'male' | 'female' => {
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'laki-laki':
            return 'male';
        case 'perempuan':
            return 'female';
        default:
            throw new Error(`Gender ${gender} tidak diketahui`);
    }
};

const translateGenderToId = (gender: string): 'LAKI-LAKI' | 'PEREMPUAN' => {
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'male':
            return 'LAKI-LAKI';
        case 'female':
            return 'PEREMPUAN';
        default:
            throw new Error(`Gender ${gender} tidak diketahui`);
    }
};

export class AssesseeService {
    static async getAssessees(page: number = 1, limit: number = 10, keyword?: string, occupation_id?: number): Promise<{ data: AssesseeResponse[]; meta: PagingMeta }> {
        const offset = (page - 1) * limit;
        const conditions = [];
        
        if (keyword) {
            conditions.push(
                or(
                    like(userTable.full_name, `%${keyword}%`),
                    like(userTable.email, `%${keyword}%`),
                    like(assesseeTable.identity_number, `%${keyword}%`),
                    like(assesseeTable.phone_no, `%${keyword}%`)
                )
            );
        }

        if (occupation_id) {
            conditions.push(eq(occupationTable.id, occupation_id));
        }

        const query = db.selectDistinct({
            id: assesseeTable.id,
            user_id: assesseeTable.user_id,
            name: userTable.full_name,
            email: userTable.email,
            identity_number: assesseeTable.identity_number,
            birth_date: assesseeTable.birth_date,
            birth_location: assesseeTable.birth_location,
            gender: assesseeTable.gender,
            nationality: assesseeTable.nationality,
            phone_no: assesseeTable.phone_no,
            house_phone_no: assesseeTable.house_phone_no,
            office_phone_no: assesseeTable.office_phone_no,
            address: assesseeTable.address,
            postal_code: assesseeTable.postal_code,
            educational_qualifications: assesseeTable.educational_qualifications,
            signature: assesseeTable.signature,
            job: assesseeJob
        }).from(assesseeTable)
            .leftJoin(userTable, eq(assesseeTable.user_id, userTable.id))
            .leftJoin(assesseeJob, eq(assesseeJob.assessee_id, assesseeTable.id))
            .leftJoin(resultTable, eq(resultTable.assessee_id, assesseeTable.id))
            .leftJoin(assessmentScheduleTable, eq(resultTable.schedule_id, assessmentScheduleTable.id))
            .leftJoin(assessmentTable, eq(assessmentScheduleTable.assessment_id, assessmentTable.id))
            .leftJoin(occupationTable, eq(assessmentTable.occupation_id, occupationTable.id));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        const assessees = await query.limit(limit).offset(offset);

        // Count query
        const countQuery = db.select({ count: sql<number>`COUNT(DISTINCT ${assesseeTable.id})` })
            .from(assesseeTable)
            .leftJoin(userTable, eq(assesseeTable.user_id, userTable.id))
            .leftJoin(resultTable, eq(resultTable.assessee_id, assesseeTable.id))
            .leftJoin(assessmentScheduleTable, eq(resultTable.schedule_id, assessmentScheduleTable.id))
            .leftJoin(assessmentTable, eq(assessmentScheduleTable.assessment_id, assessmentTable.id))
            .leftJoin(occupationTable, eq(assessmentTable.occupation_id, occupationTable.id));

        if (conditions.length > 0) {
            countQuery.where(and(...conditions));
        }

        const countRows = await countQuery;
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return { data: assessees.map(this.formatAssesseeResponse), meta: { current_page: page, limit, total, total_pages: totalPages } };
    }

    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await db.select({
            id: assesseeTable.id,
            user_id: assesseeTable.user_id,
            name: userTable.full_name,
            email: userTable.email,
            identity_number: assesseeTable.identity_number,
            birth_date: assesseeTable.birth_date,
            birth_location: assesseeTable.birth_location,
            gender: assesseeTable.gender,
            nationality: assesseeTable.nationality,
            phone_no: assesseeTable.phone_no,
            house_phone_no: assesseeTable.house_phone_no,
            office_phone_no: assesseeTable.office_phone_no,
            address: assesseeTable.address,
            postal_code: assesseeTable.postal_code,
            educational_qualifications: assesseeTable.educational_qualifications,
            signature: assesseeTable.signature,
            job: assesseeJob
        }).from(assesseeTable)
            .leftJoin(userTable, eq(assesseeTable.user_id, userTable.id))
            .leftJoin(assesseeJob, eq(assesseeJob.assessee_id, assesseeTable.id))
            .where(eq(assesseeTable.id, id));
        
        if (assessee.length === 0) throw new NotFoundError('Assessee');
        
        // If you expect multiple jobs, you might want to aggregate them
        const assesseeData = {
            ...assessee[0],
            jobs: assessee.map(row => row.job).filter(job => job !== null)
        };
        
        return this.formatAssesseeResponse(assesseeData);
    }
    

    static async createAssessee(data: AssesseeRequest): Promise<AssesseeResponse> {
        const existing = await db.query.assessee.findFirst({ where: eq(assesseeTable.user_id, data.user_id) });
        if (existing) throw new DuplicateEntryError('Assessee untuk user_id', data.user_id.toString());

        await db.insert(assesseeTable).values({
            user_id: data.user_id,
            identity_number: data.identity_number,
            birth_date: new Date(data.birth_date) as any,
            birth_location: data.birth_location,
            gender: translateGenderToEn(data.gender) as any,
            nationality: data.nationality,
            phone_no: data.phone_no,
            house_phone_no: data.house_phone_no ?? null as any,
            office_phone_no: data.office_phone_no ?? null as any,
            address: data.address,
            postal_code: data.postal_code ?? null as any,
            educational_qualifications: data.educational_qualifications,
            signature: (data as any).signature ?? null as any,
        });
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.user_id, data.user_id) });
        if (!assessee) throw new NotFoundError('Assessee');
        return this.formatAssesseeResponse(assessee);
    }

    static async updateAssessee(id: number, data: AssesseeRequest): Promise<AssesseeResponse> {
        const existing = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!existing) throw new NotFoundError('Assessee');

        await db.update(assesseeTable).set({
            user_id: data.user_id,
            identity_number: data.identity_number,
            birth_date: new Date(data.birth_date) as any,
            birth_location: data.birth_location,
            gender: translateGenderToEn(data.gender) as any,
            nationality: data.nationality,
            phone_no: data.phone_no,
            house_phone_no: data.house_phone_no ?? null as any,
            office_phone_no: data.office_phone_no ?? null as any,
            address: data.address,
            postal_code: data.postal_code ?? null as any,
            educational_qualifications: data.educational_qualifications,
            signature: (data as any).signature ?? null as any,
        }).where(eq(assesseeTable.id, id));

        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!assessee) throw new NotFoundError('Assessee');
        return this.formatAssesseeResponse(assessee);
    }

    static async deleteAssessee(id: number): Promise<void> {
        const existing = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!existing) throw new NotFoundError('Assessee');
        await db.delete(assesseeTable).where(eq(assesseeTable.id, id));
    }

    private static formatAssesseeResponse(assessee: any): AssesseeResponse {
        return {
            id: assessee.id,
            user_id: assessee.user_id,
            name: assessee.name,
            email: assessee.email,
            identity_number: assessee.identity_number,
            birth_date: assessee.birth_date,
            birth_location: assessee.birth_location,
            gender: assessee.gender,
            nationality: assessee.nationality,
            phone_no: assessee.phone_no,
            house_phone_no: assessee.house_phone_no,
            office_phone_no: assessee.office_phone_no,
            address: assessee.address,
            postal_code: assessee.postal_code,
            educational_qualifications: assessee.educational_qualifications,
            signature: assessee.signature,
            job: assessee.job
        };
    }

    static async exportAssesseesToExcel(filters: {
        occupation_id?: number;
        scheme_id?: number;
        schedule_id?: number;
        is_competent?: boolean;
    }) {
      
        const conditions = [];

        if (filters.occupation_id) {
            conditions.push(eq(occupationTable.id, filters.occupation_id));
        }
        if (filters.scheme_id) {
            conditions.push(eq(schemeTable.id, filters.scheme_id));
        }
        if (filters.schedule_id) {
            conditions.push(eq(assessmentScheduleTable.id, filters.schedule_id));
        }
        if (filters.is_competent !== undefined) {
            conditions.push(eq(resultTable.is_competent, filters.is_competent));
        }

        const query = db.select({
            id: assesseeTable.id,
            name: userTable.full_name,
            email: userTable.email,
            identity_number: assesseeTable.identity_number,
            birth_date: assesseeTable.birth_date,
            birth_location: assesseeTable.birth_location,
            gender: assesseeTable.gender,
            phone_no: assesseeTable.phone_no,
            address: assesseeTable.address,
            postal_code: assesseeTable.postal_code,
            educational_qualifications: assesseeTable.educational_qualifications,
            institution_name: assesseeJob.institution_name,
            occupation_name: occupationTable.name,
            scheme_name: schemeTable.name,
            is_competent: resultTable.is_competent,
        })
        .from(assesseeTable)
        .leftJoin(userTable, eq(assesseeTable.user_id, userTable.id))
        .leftJoin(assesseeJob, eq(assesseeJob.assessee_id, assesseeTable.id))
        .leftJoin(resultTable, eq(resultTable.assessee_id, assesseeTable.id))
        .leftJoin(assessmentScheduleTable, eq(resultTable.schedule_id, assessmentScheduleTable.id))
        .leftJoin(assessmentTable, eq(assessmentScheduleTable.assessment_id, assessmentTable.id))
        .leftJoin(occupationTable, eq(assessmentTable.occupation_id, occupationTable.id))
        .leftJoin(schemeTable, eq(occupationTable.scheme_id, schemeTable.id));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        const assessees = await query;

        if (!assessees.length) {
            throw new NotFoundError('Data asesi tidak ditemukan untuk kriteria ini');
        }

        // Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rekap Data Asesi');

        // Header
        const headers = [
            'No',
            'Nama Lengkap',
            'No. Identitas (NIK/NISN)',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Jenis Kelamin',
            'No. HP / WhatsApp',
            'Email',
            'Pendidikan',
            'Asal Sekolah / Instansi',
            'Alamat',
            'Skema',
            'Okupasi',
            'Status Kompetensi'
        ];

        const headerRow = worksheet.addRow(headers);

        // Styling Header
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
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
        headerRow.height = 28;

        assessees.forEach((row, index) => {
            // Format tanggal lahir
            let formattedBirthDate = '-';
            if (row.birth_date) {
                const d = new Date(row.birth_date);
                if (!isNaN(d.getTime())) {
                    formattedBirthDate = d.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });
                }
            }

            // Format gender
            const genderDisplay = row.gender?.toLowerCase() === 'male' || row.gender?.toLowerCase() === 'laki-laki'
                ? 'Laki-Laki'
                : 'Perempuan';

            // Format status kompetensi
            let statusKompetensi = 'Belum Ujian';
            if (row.is_competent === true) statusKompetensi = 'Kompeten';
            else if (row.is_competent === false) statusKompetensi = 'Belum Kompeten';

            const dataRow = worksheet.addRow([
                index + 1,
                row.name || '-',
                row.identity_number || '-',
                row.birth_location || '-',
                formattedBirthDate,
                genderDisplay,
                row.phone_no || '-',
                row.email || '-',
                row.educational_qualifications || '-',
                row.institution_name || '-',
                row.address || '-',
                row.scheme_name || '-',
                row.occupation_name || '-',
                statusKompetensi
            ]);

            // Border & Alignment baris data
            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (colNumber === 1 || colNumber === 5 || colNumber === 6 || colNumber === 14) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    cell.alignment = { vertical: 'middle' };
                }
            });
            dataRow.height = 22;
        });

        // Lebar tiap kolom
        worksheet.columns = [
            { width: 6 },  // No
            { width: 28 }, // Nama
            { width: 24 }, // NIK
            { width: 18 }, // Tempat Lahir
            { width: 20 }, // Tgl Lahir
            { width: 15 }, // Gender
            { width: 20 }, // No HP
            { width: 28 }, // Email
            { width: 20 }, // Pendidikan
            { width: 26 }, // Asal Instansi
            { width: 35 }, // Alamat
            { width: 25 }, // Skema
            { width: 28 }, // Okupasi
            { width: 20 }, // Status Kompetensi
        ];
        return await workbook.xlsx.writeBuffer();
    }
}

