import { db } from '../../../config/drizzle';
import { AK03Request, AK03Response } from './ak-03.type';
import { NotFoundError } from '../../../common/error';
import { result as resultTable, resultAk03Header as ak03HeaderTable, resultAk03 as ak03RowTable, assessment as assessmentTable, occupation as occupationTable, scheme as schemeTable, assessee as assesseeTable, assessor as assessorTable, user as userTable, assessmentSchedule } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class AK03Service {
  static async createAK03(data: AK03Request): Promise<AK03Response> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!result) throw new NotFoundError('Result');

    const existingHeader = await db.query.resultAk03Header.findFirst({ where: eq(ak03HeaderTable.result_id, data.result_id) });
    if (existingHeader) {
      throw new Error(`AK-03 with result_id ${data.result_id} already exists`);
    }

    const [created] = await db.insert(ak03HeaderTable).values({
      result_id: data.result_id,
      comment: data.comment ?? null as any,
    });

    const header = await db.query.resultAk03Header.findFirst({ where: eq(ak03HeaderTable.result_id, data.result_id) });
    if (!header) throw new NotFoundError('AK03 Header');

    for (const item of data.items) {
      await db.insert(ak03RowTable).values({
        header_id: header.id,
        question: item.question,
        answer: item.answer,
        comment: item.comment ?? null as any,
      });
    }

    const answers = await db.query.resultAk03.findMany({ where: eq(ak03RowTable.header_id, header.id) });
    return formatAK03Response({ ...header, answers });
  }

  static async getResultDetails(result_id: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) {
      throw new NotFoundError('Result');
    }
    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
    const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentSchedule.assessment_id, result.assessment_id) });    
    const header = await db.query.resultAk03Header.findFirst({ where: eq(ak03HeaderTable.result_id, result.id) });
    if (!header) throw new NotFoundError('Result header');
    const answers = await db.query.resultAk03.findMany({ where: eq(ak03RowTable.header_id, header.id) });

    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      schedule: schedule || null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
      assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.created_at,
      result_ak03: { ...header, answers },
    };
  }
}

function formatAK03Response(header: any): AK03Response {
  return {
    id: header.id,
    result_id: header.result_id,
    comment: header.comment,
    rows: header.answers.map((row: any) => ({
      id: row.id,
      header_id: row.header_id,
      question: row.question,
      answer: row.answer,
      comment: row.comment,
    })),
  };
}
