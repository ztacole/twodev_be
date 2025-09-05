import { db } from '../../../config/drizzle';
import { result as resultTable, resultAk05 as resultAk05Table, assessment as assessmentTable, occupation as occupationTable, scheme as schemeTable, assessee as assesseeTable, assessor as assessorTable, user as userTable } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { AK05Request, AK05Response } from './ak-05.type';
import { NotFoundError } from '../../../common/error';

export class AK05Service {
  static async createAK05(data: AK05Request): Promise<AK05Response[]> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!result) throw new NotFoundError('Result');

    const existing = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.resultId, data.result_id) });
    if (existing) {
      await db
        .update(resultAk05Table)
        .set({
          isCompetent: data.items[0]?.is_competent ?? false,
          description: data.items[0]?.description ?? null,
          negativePositiveAspects: data.items[0]?.negative_positive_aspects ?? null,
          rejectionNotes: data.items[0]?.rejection_notes ?? null,
          improvementSuggestions: data.items[0]?.improvement_suggestions ?? null,
          notes: data.items[0]?.notes ?? null,
          approvedAssessor: data.items[0]?.approved_assessor ?? false,
        })
        .where(eq(resultAk05Table.resultId, data.result_id));
    } else {
      await db.insert(resultAk05Table).values({
        resultId: data.result_id,
        isCompetent: data.items[0]?.is_competent ?? false,
        description: data.items[0]?.description ?? null,
        negativePositiveAspects: data.items[0]?.negative_positive_aspects ?? null,
        rejectionNotes: data.items[0]?.rejection_notes ?? null,
        improvementSuggestions: data.items[0]?.improvement_suggestions ?? null,
        notes: data.items[0]?.notes ?? null,
        approvedAssessor: data.items[0]?.approved_assessor ?? false,
      });
    }

    if (data.items[0]?.is_competent) {
      await db.update(resultTable).set({ isCompetent: true }).where(eq(resultTable.id, data.result_id));
    }

    const ak05 = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.resultId, data.result_id) });
    if (!ak05) throw new NotFoundError('AK05');

    const enriched = await buildAK05Response(ak05);
    return [enriched];
  }

  static async getAK05ByResultId(result_id: number): Promise<AK05Response | null> {
    const ak05 = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.resultId, result_id) });
    if (!ak05) return null;
    return await buildAK05Response(ak05);
  }

  // AK-05 Approval
  static async approvedByAssessor(resultId: number): Promise<AK05Response> {
    await db.update(resultAk05Table).set({ approvedAssessor: true }).where(eq(resultAk05Table.resultId, resultId));
    const updated = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.resultId, resultId) });
    if (!updated) throw new NotFoundError('AK05');
    return await buildAK05Response(updated);
  }
}

async function buildAK05Response(ak05: any): Promise<AK05Response> {
  const result = await db.query.result.findFirst({ where: eq(resultTable.id, ak05.resultId) });
  if (!result) throw new NotFoundError('Result');

  const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessmentId) });
  let occupation: any = null;
  let scheme: any = null;
  if (assessment) {
    occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) });
    if (occupation) {
      scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) });
    }
  }

  const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) });
  const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
  const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessorId) });
  const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) }) : null;

  return {
    id: ak05.id,
    result: {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, user: { full_name: assesseeUser.fullName, email: assesseeUser.email } } as any : null,
      assessor: assessor && assessorUser ? { id: assessor.id, user: { full_name: assessorUser.fullName, email: assessorUser.email }, no_reg_met: assessor.noRegMet } as any : null,
      tuk: result.tuk,
      created_at: result.createdAt,
      result_ak05: ak05 as any,
    } as any,
    is_competent: ak05.isCompetent,
  };
}
