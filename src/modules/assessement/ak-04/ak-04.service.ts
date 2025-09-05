import { db } from '../../../config/drizzle';
import { resultAk04, result as resultTable } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { AK04Request, AK04Response } from './ak-04.type';
import { NotFoundError } from '../../../common/error';

export class AK04Service {
  static async createAK04(data: AK04Request): Promise<AK04Response> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!result) throw new NotFoundError('Result');

    const existing = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.resultId, data.result_id)
    });

    if (existing) {
      await db
        .update(resultAk04)
        .set({
          approvedAssessee: data.approved_assessee ?? false,
          q1Yes: data.q1_yes,
          q2Yes: data.q2_yes,
          q3Yes: data.q3_yes,
          reason: data.reason ?? ''
        })
        .where(eq(resultAk04.id, existing.id));
      const updated = await db.query.resultAk04.findFirst({ where: eq(resultAk04.id, existing.id) });
      return updated as unknown as AK04Response;
    }

    await db
      .insert(resultAk04)
      .values({
        resultId: data.result_id,
        approvedAssessee: data.approved_assessee ?? false,
        q1Yes: data.q1_yes,
        q2Yes: data.q2_yes,
        q3Yes: data.q3_yes,
        reason: data.reason ?? ''
      });
    const created = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.resultId, data.result_id)
    });
    return created as unknown as AK04Response;
  }

  static async getAK04ByResultId(resultId: number): Promise<AK04Response> {
    const record = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.resultId, resultId)
    });
    if (!record) throw new NotFoundError('AK04');
    return record as unknown as AK04Response;
  }

  static async getResultDetails(resultId: number): Promise<AK04Response> {
    const record = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.resultId, resultId)
    });
    if (!record) throw new NotFoundError('AK04');
    return record as unknown as AK04Response;
  }

  static async approvedByAssessee(resultId: number): Promise<AK04Response> {
    const existing = await db.query.resultAk04.findFirst({ where: eq(resultAk04.resultId, resultId) });
    if (!existing) throw new NotFoundError('AK04');
    await db.update(resultAk04).set({ approvedAssessee: true }).where(eq(resultAk04.id, existing.id));
    const updated = await db.query.resultAk04.findFirst({ where: eq(resultAk04.id, existing.id) });
    return updated as unknown as AK04Response;
  }
}
