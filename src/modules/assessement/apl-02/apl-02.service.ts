import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { db } from '../../../config/drizzle';
import { ElementResponse, GenerateAsssessorRequest, ElementRequest, ResultRequest } from './apl-02.type';
import { result as resultTable, resultApl02Header as apl02HeaderTable, resultApl02 as apl02RowTable, apl02Evidence as apl02EvidenceTable, ucApl02 as ucApl02Table, elementApl02 as elementApl02Table, elementDetailsApl02 as elementDetailsApl02Table, assessment as assessmentTable, assessee as assesseeTable, user as userTable, occupation as occupationTable, scheme as schemeTable, resultDoc as resultDocTable } from '../../../../drizzle/schema';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';

export class APL02Service {
  static async getUnitsAPL02(result_id: number): Promise<any[]> {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });

    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const unitCompetencies = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, existingResult.assessment_id));
    const elementsByUc = await Promise.all(unitCompetencies.map(async (uc) => {
      const elements = await db.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, uc.id));
      const results = await db.select().from(apl02RowTable).where(eq(apl02RowTable.result_apl02_id, result_id));
      return { uc, elements, results };
    }));

    return Promise.all(elementsByUc.map(async ({ uc, elements, results }) => {
      const totalElements = elements.length;
      let completedElements = 0;
      for (const el of elements) {
        const row = await db.query.resultApl02.findFirst({ where: and(eq(apl02RowTable.result_apl02_id, result_id), eq(apl02RowTable.element_id, el.id)) });
        if (row) completedElements += 1;
      }
      const finished = totalElements > 0 && completedElements === totalElements;
      return {
        id: uc.id,
        unit_code: uc.unit_code,
        title: uc.title,
        finished,
        progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
        total_elements: totalElements,
        completed_elements: completedElements
      };
    }));
  }

  static async getElementsByUnitId(result_id: number, unitId: number): Promise<any[]> {
    const existingUc = await db.query.ucApl02.findFirst({ where: eq(ucApl02Table.id, unitId) });
    if (!existingUc) {
      throw new NotFoundError('Unit competency');
    }

    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const elements = await db.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, unitId));

    return Promise.all(elements.map(async (element) => {
      const row = await db.query.resultApl02.findFirst({ where: and(eq(apl02RowTable.result_apl02_id, result_id), eq(apl02RowTable.element_id, element.id)) });
      const evidences = row ? await db.select().from(apl02EvidenceTable).where(eq(apl02EvidenceTable.result_apl02_id, row.id)) : [];
      const details = await db.select().from(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.element_id, element.id));
      return {
        id: element.id,
        uc_id: element.uc_id,
        title: element.title,
        details: details.map(d => ({ id: d.id, description: d.description })),
        result: row ? {
          id: row.id,
          header_id: row.result_apl02_id,
          element_id: row.element_id,
          is_competent: row.is_competent,
          evidences: evidences.map(e => ({ id: e.id, evidence: e.evidence }))
        } : null
      }
    }));
  }

  static async sendResult(data: ElementRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, Number(data.result_id)) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, Number(data.result_id)) });
    if (!header) {
      throw new NotFoundError('APL02 header');
    }

    const elements = data.elements.map(element => Number(element.element_id));
    const existingElements = elements.length ? await db.select().from(elementApl02Table).where(inArray(elementApl02Table.id, elements)) : [];

    if (existingElements.length !== elements.length) {
      throw new NotFoundError('Element');
    }

    const results = await Promise.all(
      data.elements.map(async (element) => {
        // upsert row
        const row = await db.query.resultApl02.findFirst({ where: and(eq(apl02RowTable.result_apl02_id, header.id), eq(apl02RowTable.element_id, Number(element.element_id))) });
        if (row) {
          await db.update(apl02RowTable).set({ is_competent: element.is_competent }).where(eq(apl02RowTable.id, row.id));
          await db.delete(apl02EvidenceTable).where(eq(apl02EvidenceTable.result_apl02_id, row.id));
          for (const ev of element.evidences) {
            await db.insert(apl02EvidenceTable).values({ result_apl02_id: row.id, evidence: ev.evidence });
          }
          const evidences = await db.select().from(apl02EvidenceTable).where(eq(apl02EvidenceTable.result_apl02_id, row.id));
          return { ...row, evidences } as any;
        } else {
          const [created] = await db.insert(apl02RowTable).values({ result_apl02_id: header.id, element_id: Number(element.element_id), is_competent: element.is_competent });
          const createdRow = await db.query.resultApl02.findFirst({ where: and(eq(apl02RowTable.result_apl02_id, header.id), eq(apl02RowTable.element_id, Number(element.element_id))) });
          if (createdRow) {
            for (const ev of element.evidences) {
              await db.insert(apl02EvidenceTable).values({ result_apl02_id: createdRow.id, evidence: ev.evidence });
            }
            const evidences = await db.select().from(apl02EvidenceTable).where(eq(apl02EvidenceTable.result_apl02_id, createdRow.id));
            return { ...createdRow, evidences } as any;
          }
          return null;
        }
      })
    );

    return results;
  }

  static async sendResultHeader(data: ResultRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, data.result_id) });
    if (!header) {
      throw new NotFoundError('APL02 header');
    }

    await db.update(apl02HeaderTable).set({ isContinue: data.is_continue }).where(eq(apl02HeaderTable.id, header.id));
    const updated = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('APL02 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    return {
      id: updated.id,
      result_id: existingResult.id,
      assessee: {
        id: assessee?.id,
        name: assesseeUser?.fullName,
        email: assesseeUser?.email
      },
      approved_assessee: updated.approvedAssessee,
      approved_assessor: updated.approvedAssessor,
      is_continue: updated.isContinue
    }
  }

  static async getUnitsResult(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('Units result');
    }

    const units = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, existingResult.assessment_id));

    return {
      id: header.id,
      result_id: header.result_id,
      assessee: {
        id: existingResult.assesseeId,
        name: (await db.query.user.findFirst({ where: eq(userTable.id, (await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) }))!.userId) }))!.fullName,
        email: (await db.query.user.findFirst({ where: eq(userTable.id, (await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) }))!.userId) }))!.email
      },
      approved_assessee: header.approvedAssessee,
      approved_assessor: header.approvedAssessor,
      is_continue: header.isContinue,
      units: units.map(unit => ({ id: unit.id, unit_code: unit.unit_code, title: unit.title }))
    };
  }

  static async getElementsResult(result_id: number, unitId: number) {
    const existingUnit = await db.query.ucApl02.findFirst({ where: eq(ucApl02Table.id, unitId) });
    if (!existingUnit) {
      throw new NotFoundError('Unit competency');
    }

    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('Elements result');
    }

    const rows = await db.query.resultApl02.findMany({ where: eq(apl02RowTable.result_apl02_id, header.id) });

    const results = await Promise.all(rows.filter(r => r).map(async (row) => {
      const element = await db.query.elementApl02.findFirst({ where: eq(elementApl02Table.id, row.element_id) });
      const details = element ? await db.select().from(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.element_id, element.id)) : [];
      const evidences = await db.select().from(apl02EvidenceTable).where(eq(apl02EvidenceTable.result_apl02_id, row.id));
      return {
        id: row.id,
        element: { ...element, details },
        is_competent: row.is_competent,
        evidences,
      };
    }));

    return {
      id: header.id,
      result_id: header.result_id,
      assessee: {
        id: existingResult.assesseeId,
        name: (await db.query.user.findFirst({ where: eq(userTable.id, (await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) }))!.userId) }))!.fullName,
        email: (await db.query.user.findFirst({ where: eq(userTable.id, (await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) }))!.userId) }))!.email
      },
      approved_assessee: header.approvedAssessee,
      approved_assessor: header.approvedAssessor,
      is_continue: header.isContinue,
      results,
    };
  }

  static async approvedByAssessor(result_id: number, data: GenerateAsssessorRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('APL02 header');
    }

    await db.update(apl02HeaderTable).set({ approvedAssessor: true, isContinue: data.reccomendation }).where(eq(apl02HeaderTable.id, header.id));
    const updated = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('APL02 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    return {
      id: updated.id,
      result_id: updated.result_id,
      assessee: {
        id: assessee?.id,
        name: assesseeUser?.fullName,
        email: assesseeUser?.email
      },
      approved_assessee: updated.approvedAssessee,
      approved_assessor: updated.approvedAssessor,
      is_continue: updated.isContinue
    }
  }

  static async approvedByAssessee(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('Result header');
    }

    await db.update(apl02HeaderTable).set({ approvedAssessee: true }).where(eq(apl02HeaderTable.id, header.id));
    const updated = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('APL02 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    return {
      id: updated.id,
      result_id: updated.result_id,
      assessee: {
        id: assessee?.id,
        name: assesseeUser?.fullName,
        email: assesseeUser?.email
      },
      approved_assessee: updated.approvedAssessee,
      approved_assessor: updated.approvedAssessor,
      is_continue: updated.isContinue
    }
  }

  static async getResultDetails(result_id: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) {
      throw new NotFoundError('Result');
    }

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    const header = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result_id) });
    if (!header) {
      throw new NotFoundError('Result header');
    }

    const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.result_id, result.id));
    if (!docs.length) {
      throw new NotFoundError('Result docs');
    }

    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
      assessor: null,
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.createdAt,
      apl02_header: header,
      approved_admin: docs[docs.length - 1].approved
    };
  }
}