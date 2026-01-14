import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { db } from '../../../config/drizzle';
import {
  result as resultTable,
  resultAk01Header as ak01HeaderTable,
  resultAk01 as ak01RowTable,
  assessment as assessmentTable,
  occupation as occupationTable,
  scheme as schemeTable,
  assessee as assesseeTable,
  assessor as assessorTable,
  user as userTable,
  assessmentSchedule as scheduleTable,
  scheduleDetail as scheduleDetailTable,
} from '../../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { 
  AK01CreateRequest, 
  AK01UpdateRequest, 
  AK01Response,
} from './ak-01.type';

export class AK01Service {
  static async createAK01(data: AK01CreateRequest): Promise<AK01Response> {
    const { result_id, evidences } = data;
  
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
  
    if (!result) {
      throw new NotFoundError('Result');
    }
  
    const header = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result_id) });
  
    if (!header) {
      throw new NotFoundError('Header AK01');
    }
  
    await db.delete(ak01RowTable).where(eq(ak01RowTable.header_id, header.id));
    for (const evidence of evidences) {
      await db.insert(ak01RowTable).values({ header_id: header.id, evidence });
    }

    const rows = await db.query.resultAk01.findMany({ where: eq(ak01RowTable.header_id, header.id) });
  
    return formatAK01Response({ ...header, rows });
  }

  static async getDataForAK01(result_id: number): Promise<any> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) {
      throw new NotFoundError('Result');
    }
    const header = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('Header AK01');
    }
    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, result.schedule_id) });
    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    const rows = await db.query.resultAk01.findMany({ where: eq(ak01RowTable.header_id, header.id) });

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
    const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;

    const detail = await db.query.scheduleDetail.findFirst({ where: and(eq(scheduleDetailTable.schedule_id, schedule.id), eq(scheduleDetailTable.assessor_id, result.assessor_id)) });
    if (!detail) {
      throw new NotFoundError('Schedule detail');
    }
  
    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email, signature: assessee.signature } : null,
      assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met, signature: assessor.signature } : null,
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.created_at,
      schedule: schedule,
      location: detail.location,
      ak01_header: { ...header, rows },
    };
  }
  
  static async getAK01ById(id: number): Promise<AK01Response> {
    const header = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.id, id) });
  
    if (!header) {
      throw new NotFoundError('Header AK01');
    }
    const rows = await db.query.resultAk01.findMany({ where: eq(ak01RowTable.header_id, header.id) });
  
    return formatAK01Response({ ...header, rows });
  }
  
  static async getAK01ByResultId(result_id: number): Promise<AK01Response> {
    const header = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result_id) });
  
    if (!header) {
      throw new NotFoundError('Header AK01');
    }
    const rows = await db.query.resultAk01.findMany({ where: eq(ak01RowTable.header_id, header.id) });
  
    return formatAK01Response({ ...header, rows });
  }
  
  static async updateAK01(id: number, data: AK01UpdateRequest): Promise<AK01Response> {
    const existingHeader = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.id, id) });

    if (!existingHeader) {
      throw new NotFoundError('Header AK01');
    }

    if (data.evidences) {
      await db.delete(ak01RowTable).where(eq(ak01RowTable.header_id, id));
      for (const evidence of data.evidences) {
        await db.insert(ak01RowTable).values({ header_id: id, evidence });
      }
    }

    const rows = await db.query.resultAk01.findMany({ where: eq(ak01RowTable.header_id, id) });

    return formatAK01Response({ ...existingHeader, rows });
  }
  
  static async deleteAK01(id: number): Promise<void> {
    const existingHeader = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.id, id) });

    if (!existingHeader) {
      throw new NotFoundError('Header AK01');
    }

    await db.delete(ak01RowTable).where(eq(ak01RowTable.header_id, id));
    await db.delete(ak01HeaderTable).where(eq(ak01HeaderTable.id, id));
  }

  // AK-O1 Approval
  static async approvedByAssessor(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('AK01 header');
    }

    await db.update(ak01HeaderTable).set({ approved_assessor: true }).where(eq(ak01HeaderTable.id, header.id));
    const updated = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('AK01 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;

    return formatApproval({ ...updated, result: { assessee: { id: assessee?.id, user: { full_name: assesseeUser?.full_name, email: assesseeUser?.email } } } });
  }

  static async approvedByAssessee(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('AK01 header');
    }

    await db.update(ak01HeaderTable).set({ approved_assessee: true }).where(eq(ak01HeaderTable.id, header.id));
    const updated = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('AK01 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;

    return formatApproval({ ...updated, result: { assessee: { id: assessee?.id, user: { full_name: assesseeUser?.full_name, email: assesseeUser?.email } } } });
  }
}

// Helpers
function formatAK01Response(ak01Header: any): AK01Response {
  return {
    id: ak01Header.id,
    result_id: ak01Header.result_id,
    approved_assessee: ak01Header.approved_assessee,
    approved_assessor: ak01Header.approved_assessor,
    rows: ak01Header.rows.map((row: any) => ({
      id: row.id,
      header_id: row.header_id,
      evidence: row.evidence
    }))
  };
}

function formatApproval(result: any) {
  return {
    id: result.id,
    result_id: result.result_id,
    assessee: {
      id: result.result.assessee.id,
      name: result.result.assessee.user.full_name,
      email: result.result.assessee.user.email,
    },
    approved_assessee: result.approved_assessee,
    approved_assessor: result.approved_assessor,
  };
}