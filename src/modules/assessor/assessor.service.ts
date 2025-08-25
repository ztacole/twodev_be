import { prisma } from '../../config/db';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssessorResponse, AssessorRequest } from './assessor.type';

export class AssessorService {
    static async getAssessors(): Promise<AssessorResponse[]> {
        const assessors = await prisma.assessor.findMany({
            include: {
                user: { include: { role: true } },
                scheme: true,
            },
        });
        return assessors.map(this.formatAssessorResponse);
    }

    static async getAssessorById(id: number): Promise<AssessorResponse> {
        const assessor = await prisma.assessor.findUnique({
            where: { id },
            include: {
                user: { include: { role: true } },
                scheme: true,
            },
        });

        if (!assessor) {
            throw new NotFoundError('Assessor');
        }

        return this.formatAssessorResponse(assessor);
    }

    static async getAssessorByUserId(userId: number): Promise<AssessorResponse> {
        const assessor = await prisma.assessor.findUnique({
            where: { user_id: userId },
            include: {
                user: { include: { role: true } },
                scheme: true,
            },
        });

        if (!assessor) {
            throw new NotFoundError('Assessor');
        }

        return this.formatAssessorResponse(assessor);
    }

    static async createAssessor(data: AssessorRequest): Promise<AssessorResponse> {
        const existing = await prisma.assessor.findFirst({
            where: { user_id: data.user_id }
        });

        if (existing) {
            throw new DuplicateEntryError('Assessor untuk user_id', data.user_id.toString());
        }

        const assessor = await prisma.assessor.create({
            data: {
                ...data,
                birth_date: new Date(data.birth_date),
                no_reg_met: data.no_reg_met
            },
            include: {
                user: { include: { role: true } },
                scheme: true,
            },
        });

        return this.formatAssessorResponse(assessor);
    }

    static async updateAssessor(id: number, data: AssessorRequest): Promise<AssessorResponse> {
        const existing = await prisma.assessor.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Assessor');
        }

        const assessor = await prisma.assessor.update({
            where: { id },
            data: {
                ...data,
                birth_date: new Date(data.birth_date),
                no_reg_met: data.no_reg_met
            },
            include: {
                user: { include: { role: true } },
                scheme: true,
            },
        });

        return this.formatAssessorResponse(assessor);
    }

    static async deleteAssessor(id: number): Promise<void> {
        const existing = await prisma.assessor.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Assessor');
        }

        await prisma.assessor.delete({ where: { id } });
    }

    private static formatAssessorResponse(assessor: any): AssessorResponse {
        return {
            id: assessor.id,
            user_id: assessor.user_id,
            scheme_id: assessor.scheme_id,
            address: assessor.address,
            phone_no: assessor.phone_no,
            birth_date: assessor.birth_date,
            no_reg_met: assessor.no_reg_met
        };
    }
}