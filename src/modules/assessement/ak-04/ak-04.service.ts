import { db } from '../../../config/drizzle';
import { 
  resultAk04,
  result as resultTable,
  assessee as assesseeTable,
  user as userTable,
  assessment as assessmentTable,
  occupation as occupationTable,
  scheme as schemeTable,
  assessor as assessorTable,
  assessmentSchedule,
} from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { AK04Request, AK04Response } from './ak-04.type';
import { NotFoundError } from '../../../common/error';

export class AK04Service {
  static async createAK04(data: AK04Request): Promise<AK04Response> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!result) throw new NotFoundError('Result');

    const existing = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.result_id, data.result_id)
    });

    if (existing) {
      await db
        .update(resultAk04)
        .set({
          approved_assessee: data.approved_assessee ?? false,
          q1_yes: data.q1_yes,
          q2_yes: data.q2_yes,
          q3_yes: data.q3_yes,
          reason: data.reason ?? ''
        })
        .where(eq(resultAk04.id, existing.id));
      const updated = await db.query.resultAk04.findFirst({ where: eq(resultAk04.id, existing.id) });
      return updated as unknown as AK04Response;
    }

    await db
      .insert(resultAk04)
      .values({
        result_id: data.result_id,
        approved_assessee: data.approved_assessee ?? false,
        q1_yes: data.q1_yes,
        q2_yes: data.q2_yes,
        q3_yes: data.q3_yes,
        reason: data.reason ?? ''
      });
    const created = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.result_id, data.result_id)
    });
    return created as unknown as AK04Response;
  }

  static async getAK04ByResult_id(result_id: number): Promise<AK04Response> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) throw new NotFoundError('Result');
    const record = await db.query.resultAk04.findFirst({
      where: eq(resultAk04.result_id, result_id)
    });
    if (!record) throw new NotFoundError('AK04');
    return record as unknown as AK04Response;
  }

  static async getResultDetails(result_id: number): Promise<any> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) {
      throw new NotFoundError('Result');
    }
    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentSchedule.id, result.schedule_id) });
    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
    const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
    const header = await db.query.resultAk04.findFirst({ where: eq(resultAk04.result_id, result.id) });
    if (!header) throw new NotFoundError('Result header');
    
    return {
      id: result.id,
      schedule: schedule,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
      assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.created_at,
      result_ak04: { ...header },
    };
  }

  static async approvedByAssessee(result_id: number): Promise<AK04Response> {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const existing = await db.query.resultAk04.findFirst({ where: eq(resultAk04.result_id, result_id) });
    if (!existing) throw new NotFoundError('AK04');
    await db.update(resultAk04).set({ approved_assessee: true }).where(eq(resultAk04.id, existing.id));
    const updated = await db.query.resultAk04.findFirst({ where: eq(resultAk04.id, existing.id) });
    return updated as unknown as AK04Response;
  }
}
