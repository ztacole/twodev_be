import { db } from '../../config/drizzle';
import { NotFoundError } from '../../common/error';
import { assessorDetail as assessorDetailTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class AssessorDetailService {
    static async getByAssessorId(assessorId: number) {
        const detail = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessorId, assessorId) });
        return detail;
    }

    static async upsertByAssessorId(assessorId: number, data: { tax_id_number?: string; bank_book_cover?: string; certificate?: string; national_id?: string }) {
        const existing = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessorId, assessorId) });
        if (existing) {
            await db.update(assessorDetailTable)
                .set({
                    taxIdNumber: data.tax_id_number ?? existing.taxIdNumber,
                    bankBookCover: data.bank_book_cover ?? existing.bankBookCover,
                    certificate: data.certificate ?? existing.certificate,
                    nationalId: data.national_id ?? existing.nationalId,
                })
                .where(eq(assessorDetailTable.assessorId, assessorId));
            const updated = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessorId, assessorId) });
            return updated;
        }

        await db.insert(assessorDetailTable).values({
            assessorId,
            taxIdNumber: data.tax_id_number ?? '',
            bankBookCover: data.bank_book_cover ?? '',
            certificate: data.certificate ?? '',
            nationalId: data.national_id ?? '',
        });
        const created = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessorId, assessorId) });
        return created;
    }
}
