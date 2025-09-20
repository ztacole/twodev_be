import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssesseeResponse, AssesseeRequest } from './asseessee.type';
import { assessee as assesseeTable, user as userTable, role as roleTable, assesseeJob } from '../../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
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
    static async getAssessees(page: number = 1, limit: number = 10): Promise<{ data: AssesseeResponse[]; meta: PagingMeta }> {
        const offset = (page - 1) * limit;
        const assessees = await db.select({
            id: assesseeTable.id,
            user_id: assesseeTable.user_id,
            name: userTable.full_name,
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
            job: assesseeJob
        }).from(assesseeTable)
            .leftJoin(userTable, eq(assesseeTable.user_id, userTable.id))
            .innerJoin(assesseeJob, eq(assesseeJob.assessee_id, assesseeTable.id))
            .limit(limit).offset(offset);
        const countRows = await db.select({ count: sql<number>`COUNT(*)` }).from(assesseeTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return { data: assessees.map(this.formatAssesseeResponse), meta: { current_page: page, limit, total, total_pages: totalPages } };
    }

    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await db.select({
            id: assesseeTable.id,
            user_id: assesseeTable.user_id,
            name: userTable.full_name,
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
            job: assesseeJob
        }).from(assesseeTable)
            .leftJoin(userTable, eq(assesseeTable.user_id, userTable.id))
            .innerJoin(assesseeJob, eq(assesseeJob.assessee_id, assesseeTable.id))
            .where(eq(assesseeTable.id, id));
        if (assessee.length === 0) throw new NotFoundError('Assessee');
        const [assesseeData] = assessee;
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
            name: assessee.user.full_name,
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
            job: assessee.job
        };
    }
}

