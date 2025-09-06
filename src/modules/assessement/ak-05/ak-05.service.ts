import { db } from '../../../config/drizzle';
import { result as resultTable, resultAk05 as resultAk05Table, assessment as assessmentTable, occupation as occupationTable, scheme as schemeTable, assessee as assesseeTable, assessor as assessorTable, user as userTable } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { AK05Request, AK05Response } from './ak-05.type';
import { NotFoundError } from '../../../common/error';

export class AK05Service {
  static async createAK05(data: AK05Request): Promise<AK05Response[]> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!result) throw new NotFoundError('Result');

    const existing = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, data.result_id) });
    if (existing) {
      await db
        .update(resultAk05Table)
        .set({
          is_competent: data.items[0]?.is_competent ?? false,
          description: data.items[0]?.description ?? null,
          negative_positive_aspects: data.items[0]?.negative_positive_aspects ?? null,
          rejection_notes: data.items[0]?.rejection_notes ?? null,
          improvement_suggestions: data.items[0]?.improvement_suggestions ?? null,
          notes: data.items[0]?.notes ?? null,
          approved_assessor: data.items[0]?.approved_assessor ?? false,
        })
        .where(eq(resultAk05Table.result_id, data.result_id));
    } else {
      await db.insert(resultAk05Table).values({
        result_id: data.result_id,
        is_competent: data.items[0]?.is_competent ?? false,
        description: data.items[0]?.description ?? null,
        negative_positive_aspects: data.items[0]?.negative_positive_aspects ?? null,
        rejection_notes: data.items[0]?.rejection_notes ?? null,
        improvement_suggestions: data.items[0]?.improvement_suggestions ?? null,
        notes: data.items[0]?.notes ?? null,
        approved_assessor: data.items[0]?.approved_assessor ?? false,
      });
    }

    if (data.items[0]?.is_competent) {
      await db.update(resultTable).set({ is_competent: true }).where(eq(resultTable.id, data.result_id));
    }

    const ak05 = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, data.result_id) });
    if (!ak05) throw new NotFoundError('AK05');

    const enriched = await buildAK05Response(ak05);
    return [enriched];
  }

  static async getAK05ByResultId(result_id: number): Promise<AK05Response | null> {
    const ak05 = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, result_id) });
    if (!ak05) return null;
    return await buildAK05Response(ak05);
  }

  // AK-05 Approval
  static async approvedByAssessor(result_id: number): Promise<AK05Response> {
    await db.update(resultAk05Table).set({ approved_assessor: true }).where(eq(resultAk05Table.result_id, result_id));
    const updated = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, result_id) });
    if (!updated) throw new NotFoundError('AK05');
    return await buildAK05Response(updated);
  }
}

async function buildAK05Response(ak05: any): Promise<AK05Response> {
  const result = await db.query.result.findFirst({ where: eq(resultTable.id, ak05.result_id) });
  if (!result) throw new NotFoundError('Result');

  const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
  let occupation: any = null;
  let scheme: any = null;
  if (assessment) {
    occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) });
    if (occupation) {
      scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) });
    }
  }

  const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
  const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
  const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
  const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;

  return {
    id: ak05.id,
    result: {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } as any : null,
      assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } as any : null,
      tuk: result.tuk,
      created_at: result.created_at,
      result_ak05: ak05 as any,
    } as any,
    is_competent: ak05.is_competent,
  };
}
