import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { db } from '../../../config/drizzle';
import { 
  result as resultTable,
  resultAk02Header as ak02HeaderTable,
  resultAk02 as ak02RowTable,
  ak02Evidence as ak02EvidenceTable,
  ucApl02 as ucApl02Table,
  assessment as assessmentTable,
  occupation as occupationTable,
  scheme as schemeTable,
  assessee as assesseeTable,
  assessor as assessorTable,
  user as userTable,
} from '../../../../drizzle/schema';
import { and, eq, inArray } from 'drizzle-orm';
import {
  AK02CreateRequest,
  AK02UpdateRequest,
  AK02Response,
} from './ak-02.type';

export class AK02Service {
  static async sendResult(data: AK02CreateRequest): Promise<AK02Response> {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id), });
    if (!result) {
      throw new NotFoundError('Result');
    }
    const header = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.resultId, data.result_id) });
    if (!header) {
      throw new NotFoundError('Header AK02');
    }

    const ucIds = data.rows.map(row => row.uc_id);
    const existingUCs = ucIds.length ? await db.select().from(ucApl02Table).where(inArray(ucApl02Table.id, ucIds)) : [];
    if (existingUCs.length !== ucIds.length) {
      throw new NotFoundError('Satu atau lebih Unit Kompetensi');
    }

    await db.delete(ak02RowTable).where(eq(ak02RowTable.headerId, header.id));
    for (const row of data.rows) {
      const [created] = await db.insert(ak02RowTable).values({ headerId: header.id, ucId: row.uc_id });
      for (const e of row.evidences) {
        await db.insert(ak02EvidenceTable).values({ resultAk02Id: (created as any).insertId ?? undefined, evidence: e });
      }
    }

    await db.update(ak02HeaderTable).set({
      isCompetent: data.is_competent,
      followUp: data.follow_up as any,
      comment: data.comment as any,
    }).where(eq(ak02HeaderTable.id, header.id));

    const rows = await db.query.resultAk02.findMany({ where: eq(ak02RowTable.headerId, header.id) });

    return formatAK02Response({ ...header, rows });
  }

  static async getUnits(resultId: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
    if (!result) {
      throw new NotFoundError('Result');
    }
    const header = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.resultId, resultId) });
    if (!header) {
      throw new NotFoundError('Result header');
    }

    const units = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessmentId, result.assessmentId));
    const rows = await db.query.resultAk02.findMany({ where: eq(ak02RowTable.headerId, header.id) });
    return {
      id: result.id,
      units: await Promise.all(units.map(async (unit) => {
        const check = rows.find(row => row.ucId === unit.id) || null;
        return {
          id: unit.id,
          code: unit.unitCode,
          title: unit.title,
          evidences: check ? (await db.select().from(ak02EvidenceTable).where(eq(ak02EvidenceTable.resultAk02Id, check.id))).map(e => e.evidence) : null
        };
      }))

    };
  }

  static async getResultDetails(resultId: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
    if (!result) {
      throw new NotFoundError('Result');
    }
    const header = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.resultId, resultId) });
    if (!header) {
      throw new NotFoundError('Result header');
    }

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessmentId) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;
    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessorId) });
    const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) }) : null;

    const rows = await db.query.resultAk02.findMany({ where: eq(ak02RowTable.headerId, header.id) });

    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
      assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.fullName, email: assessorUser.email, no_reg_met: assessor.noRegMet } : null,
      tuk: result.tuk,
      is_competent: result.isCompetent,
      created_at: result.createdAt,
      ak02_headers: {
        id: header.id,
        is_competent: header.isCompetent,
        follow_up: header.followUp,
        comment: header.comment,
        rows: await Promise.all(rows.map(async row => ({
          id: row.id,
          unit_id: row.ucId,
          unit_title: (await db.query.ucApl02.findFirst({ where: eq(ucApl02Table.id, row.ucId) }))?.title,
          unit_code: (await db.query.ucApl02.findFirst({ where: eq(ucApl02Table.id, row.ucId) }))?.unitCode,
          evidences: (await db.select().from(ak02EvidenceTable).where(eq(ak02EvidenceTable.resultAk02Id, row.id))).map(e => ({ id: e.id, evidence: e.evidence }))
        })))
      }
    };
  }

  // AK-02 Approval
  static async approvedByAssessor(resultId: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.resultId, resultId) });
    if (!header) {
      throw new NotFoundError('AK02 header');
    }

    await db.update(ak02HeaderTable).set({ approvedAssessor: true }).where(eq(ak02HeaderTable.id, header.id));
    const updated = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('AK02 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    return formatApproval({ ...updated, assessee: { id: assessee?.id, user: { full_name: assesseeUser?.fullName, email: assesseeUser?.email } } } as any);
  }

  static async approvedByAssessee(resultId: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.resultId, resultId) });
    if (!header) {
      throw new NotFoundError('AK02 header');
    }

    await db.update(ak02HeaderTable).set({ approvedAssessee: true }).where(eq(ak02HeaderTable.id, header.id));
    const updated = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('AK02 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    return formatApproval({ ...updated, assessee: { id: assessee?.id, user: { full_name: assesseeUser?.fullName, email: assesseeUser?.email } } } as any);
  }
}

// Helpers

function formatAK02Response(ak02Header: any): AK02Response {
  return {
    id: ak02Header.id,
    result_id: ak02Header.resultId,
    approved_assessee: ak02Header.approvedAssessee,
    approved_assessor: ak02Header.approvedAssessor,
    is_competent: ak02Header.isCompetent,
    follow_up: ak02Header.followUp,
    comment: ak02Header.comment,
    rows: ak02Header.rows.map((row: any) => ({
      id: row.id,
      header_id: row.headerId,
      uc_id: row.ucId,
      evidence: row.evidence,
      uc: {
        id: row.uc?.id,
        unit_code: row.uc?.unitCode,
        title: row.uc?.title
      }
    }))
  };
}

function formatApproval(result: any) {
  return {
    id: result.id,
    result_id: result.result_id,
    assessee: {
      id: result.assessee.id,
      name: result.assessee.user.full_name,
      email: result.assessee.user.email,
    },
    approved_assessee: result.approvedAssessee,
    approved_assessor: result.approvedAssessor,
  };
}