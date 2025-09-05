import { db } from '../../config/drizzle';
import { NotFoundError } from '../../common/error';
import { assessorDetail as assessorDetailTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class AssessorDetailService {
    static async getByAssessorId(assessor_id: number) {
        const detail = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessor_id, assessor_id) });
        return detail;
    }

    static async upsertByAssessorId(assessor_id: number, data: { tax_id_number?: string; bank_book_cover?: string; certificate?: string; national_id?: string }) {
        const existing = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessor_id, assessor_id) });
        if (existing) {
            await db.update(assessorDetailTable)
                .set({
                    tax_id_number: data.tax_id_number ?? existing.tax_id_number,
                    bank_book_cover: data.bank_book_cover ?? existing.bank_book_cover,
                    certificate: data.certificate ?? existing.certificate,
                    national_id: data.national_id ?? existing.national_id,
                })
                .where(eq(assessorDetailTable.assessor_id, assessor_id));
            const updated = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessor_id, assessor_id) });
            return updated;
        }

        await db.insert(assessorDetailTable).values({
            assessor_id,
            tax_id_number: data.tax_id_number ?? '',
            bank_book_cover: data.bank_book_cover ?? '',
            certificate: data.certificate ?? '',
            national_id: data.national_id ?? '',
        });
        const created = await db.query.assessorDetail.findFirst({ where: eq(assessorDetailTable.assessor_id, assessor_id) });
        return created;
    }
}
