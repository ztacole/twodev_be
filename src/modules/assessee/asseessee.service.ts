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
    static async getAssessees(): Promise<AssesseeResponse[]> {
        const assessees = await db.select().from(assesseeTable);
        return assessees.map(this.formatAssesseeResponse);
    }

    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!assessee) throw new NotFoundError('Assessee');
        return this.formatAssesseeResponse(assessee);
    }

    static async createAssessee(data: AssesseeRequest): Promise<AssesseeResponse> {
        const existing = await db.query.assessee.findFirst({ where: eq(assesseeTable.userId, data.user_id) });
        if (existing) throw new DuplicateEntryError('Assessee untuk user_id', data.user_id.toString());

        await db.insert(assesseeTable).values({
            userId: data.user_id,
            identityNumber: data.identity_number,
            birthDate: new Date(data.birth_date) as any,
            birthLocation: data.birth_location,
            gender: translateGenderToEn(data.gender) as any,
            nationality: data.nationality,
            phoneNo: data.phone_no,
            housePhoneNo: data.house_phone_no ?? null as any,
            officePhoneNo: data.office_phone_no ?? null as any,
            address: data.address,
            postalCode: data.postal_code ?? null as any,
            educationalQualifications: data.educational_qualifications,
        });
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.userId, data.user_id) });
        if (!assessee) throw new NotFoundError('Assessee');
        return this.formatAssesseeResponse(assessee);
    }

    static async updateAssessee(id: number, data: AssesseeRequest): Promise<AssesseeResponse> {
        const existing = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!existing) throw new NotFoundError('Assessee');

        await db.update(assesseeTable).set({
            userId: data.user_id,
            identityNumber: data.identity_number,
            birthDate: new Date(data.birth_date) as any,
            birthLocation: data.birth_location,
            gender: translateGenderToEn(data.gender) as any,
            nationality: data.nationality,
            phoneNo: data.phone_no,
            housePhoneNo: data.house_phone_no ?? null as any,
            officePhoneNo: data.office_phone_no ?? null as any,
            address: data.address,
            postalCode: data.postal_code ?? null as any,
            educationalQualifications: data.educational_qualifications,
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
            user_id: assessee.userId,
            identity_number: assessee.identityNumber,
            birth_date: assessee.birthDate,
            birth_location: assessee.birthLocation,
            gender: assessee.gender,
            nationality: assessee.nationality,
            phone_no: assessee.phoneNo,
            house_phone_no: assessee.housePhoneNo,
            office_phone_no: assessee.officePhoneNo,
            address: assessee.address,
            postal_code: assessee.postalCode,
            educational_qualifications: assessee.educationalQualifications,
        };
    }
}

