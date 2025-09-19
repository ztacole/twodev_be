import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssesseeResponse, AssesseeRequest } from './asseessee.type';
import { assessee as assesseeTable, user as userTable, role as roleTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

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
    static async getAssessees(page: number = 1, limit: number = 10): Promise<{ data: AssesseeResponse[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
        const offset = (page - 1) * limit;
        const assessees = await db.select().from(assesseeTable).limit(limit).offset(offset);
        const countRows = await db.select({ count: (await import('drizzle-orm')).sql<number>`COUNT(*)` }).from(assesseeTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return { data: assessees.map(this.formatAssesseeResponse), meta: { page, limit, total, totalPages } };
    }

    static async getAllAssessees(): Promise<AssesseeResponse[]> {
        const assessees = await db.select().from(assesseeTable);
        return assessees.map(this.formatAssesseeResponse);
    }

    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!assessee) throw new NotFoundError('Assessee');
        return this.formatAssesseeResponse(assessee);
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
            identity_number: assessee.identityNumber,
            birth_date: assessee.birth_date,
            birth_location: assessee.b_lrthLocation,
            gender: assessee.gender,
            nationality: assessee.nationality,
            phone_no: assessee.pho_neNo,
            house_phone_no: assessee.ho_nsePhoneNo,
            office_phone_no: assessee.of_nicePhoneNo,
            address: assessee.address,
            postal_code: assessee.p_cstalCode,
            educational_qualifications: assessee.educationalQualifications,
        };
    }
}

