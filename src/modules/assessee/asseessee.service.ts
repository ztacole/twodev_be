import { prisma } from '../../config/db';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssesseeResponse, AssesseeRequest } from './asseessee.type';

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
        const assessees = await prisma.assessee.findMany({
            include: {
                user: { include: { role: true } },
            },
        });
        return assessees.map(this.formatAssesseeResponse);
    }

    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await prisma.assessee.findUnique({
            where: { id },
            include: { user: { include: { role: true } } },
        });

        if (!assessee) throw new NotFoundError('Assessee');
        return this.formatAssesseeResponse(assessee);
    }

    static async createAssessee(data: AssesseeRequest): Promise<AssesseeResponse> {
        const existing = await prisma.assessee.findFirst({ where: { user_id: data.user_id } });
        if (existing) throw new DuplicateEntryError('Assessee untuk user_id', data.user_id.toString());

        const assessee = await prisma.assessee.create({
            data: {
                ...data,
                birth_date: new Date(data.birth_date),
                gender: translateGenderToEn(data.gender),
            },
            include: { user: { include: { role: true } } },
        });
        return this.formatAssesseeResponse(assessee);
    }

    static async updateAssessee(id: number, data: AssesseeRequest): Promise<AssesseeResponse> {
        const existing = await prisma.assessee.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Assessee');

        const assessee = await prisma.assessee.update({
            where: { id },
            data: {
                ...data,
                birth_date: new Date(data.birth_date),
                gender: translateGenderToEn(data.gender),
            },
            include: { user: { include: { role: true } } },
        });
        return this.formatAssesseeResponse(assessee);
    }

    static async deleteAssessee(id: number): Promise<void> {
        const existing = await prisma.assessee.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Assessee');
        await prisma.assessee.delete({ where: { id } });
    }

    private static formatAssesseeResponse(assessee: any): AssesseeResponse {
        return {
            id: assessee.id,
            user_id: assessee.user_id,
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
        };
    }
}

