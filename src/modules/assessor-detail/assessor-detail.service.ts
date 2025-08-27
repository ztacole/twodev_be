import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/error';

export class AssessorDetailService {
    static async getByAssessorId(assessorId: number) {
        const detail = await prisma.assessor_detail.findUnique({ where: { assessor_id: assessorId } });
        return detail;
    }

    static async upsertByAssessorId(assessorId: number, data: { tax_id_number?: string; bank_book_cover?: string; certificate?: string; national_id?: string }) {
        const existing = await prisma.assessor_detail.findUnique({ where: { assessor_id: assessorId } });
        if (existing) {
            const updated = await prisma.assessor_detail.update({
                where: { assessor_id: assessorId },
                data: {
                    tax_id_number: data.tax_id_number ?? existing.tax_id_number,
                    bank_book_cover: data.bank_book_cover ?? existing.bank_book_cover,
                    certificate: data.certificate ?? existing.certificate,
                    national_id: data.national_id ?? existing.national_id,
                },
            });
            return updated;
        }

        const created = await prisma.assessor_detail.create({
            data: {
                assessor_id: assessorId,
                tax_id_number: data.tax_id_number ?? '',
                bank_book_cover: data.bank_book_cover ?? '',
                certificate: data.certificate ?? '',
                national_id: data.national_id ?? '',
            },
        });
        return created;
    }
}
