import { NotFoundError } from "../../../common/error";
import { AssessorApproveRequest, GroupIA01Response, SendResultRequest } from "./ia-01.type";
import { db } from "../../../config/drizzle";
import {
  result as resultTable,
  assessment as assessmentTable,
  groupIa01 as groupIa01Table,
  ucIa01 as ucIa01Table,
  elementIa as elementIaTable,
  elementDetailsIa as elementDetailsIaTable,
  resultIa01Header as ia01HeaderTable,
  resultIa01 as ia01RowTable,
  assessee as assesseeTable,
  user as userTable,
  occupation as occupationTable,
  scheme as schemeTable,
} from "../../../../drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";

export class IA01Service {
    static async getIA01Groups(resultId: number): Promise<GroupIA01Response[]> {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, resultId), });
    if (!existingResult) throw new NotFoundError('Result');

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, existingResult.assessmentId) });
    if (!assessment) throw new NotFoundError('Assessment');

    const groups = await db.select().from(groupIa01Table).where(eq(groupIa01Table.assessmentId, assessment.id));

    const unitsByGroup = new Map<number, any[]>();
    for (const g of groups) {
      const units = await db.select().from(ucIa01Table).where(eq(ucIa01Table.groupId, g.id));
      unitsByGroup.set(g.id, units);
    }

    return Promise.all(groups.map(async (group) => {
      const units = unitsByGroup.get(group.id) || [];
      const decorated = await Promise.all(units.map(async (unit) => {
        const elements = await db.select().from(elementIaTable).where(eq(elementIaTable.ucId, unit.id));
        let completedElements = 0;
        for (const el of elements) {
          const details = await db.select().from(elementDetailsIaTable).where(eq(elementDetailsIaTable.elementId, el.id));
          const hasResult = await db.query.resultIa01.findFirst({ where: and(eq(ia01RowTable.headerId, (await IA01Service.getHeaderId(resultId))!), inArray(ia01RowTable.elementDetailId, details.map(d => d.id))) });
          if (hasResult) completedElements += 1;
        }
        const totalElements = elements.length;
                const finished = totalElements > 0 && totalElements === completedElements;
                return {
                    id: unit.id,
          unit_code: unit.unitCode,
                    title: unit.title,
          finished,
          progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
        };
      }));
      return {
        id: group.id,
        assessment_id: group.assessmentId,
        name: group.name,
        units: decorated,
      } as GroupIA01Response;
        }));
    }

    static async getElementsByUnitId(resultId: number, unitId: number) {
    const existingUnit = await db.query.ucIa01.findFirst({ where: eq(ucIa01Table.id, unitId) });
    if (!existingUnit) throw new NotFoundError('Unit competency');

    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
    if (!existingResult) throw new NotFoundError('Result');

    const elements = await db.select().from(elementIaTable).where(eq(elementIaTable.ucId, unitId));

    const headerId = await IA01Service.getHeaderId(resultId);
    return Promise.all(elements.map(async (element) => {
      const details = await db.select().from(elementDetailsIaTable).where(eq(elementDetailsIaTable.elementId, element.id));
      const rows = headerId ? await db.select().from(ia01RowTable).where(and(eq(ia01RowTable.headerId, headerId), inArray(ia01RowTable.elementDetailId, details.map(d => d.id)))) : [];
      return {
            id: element.id,
        uc_id: element.ucId,
            title: element.title,
        details: details.map((detail) => {
          const result = rows.find(r => r.elementDetailId === detail.id);
                return {
                    id: detail.id,
                    description: detail.description,
                    benchmark: detail.benchmark,
                    result: result ? {
                        id: result.id,
              header_id: result.headerId,
              is_competent: result.isCompetent,
              evaluation: result.evaluation,
            } : null,
          };
        })
      };
    }));
    }

    static async sendResult(data: SendResultRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!existingResult) throw new NotFoundError('Result');

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, data.result_id) });
    if (!header) throw new NotFoundError('IA01 header');

    const elementDetailIds = data.elements.map(e => Number(e.element_detail_id));
    const existingElements = elementDetailIds.length ? await db.select().from(elementDetailsIaTable).where(inArray(elementDetailsIaTable.id, elementDetailIds)) : [];
    if (existingElements.length !== elementDetailIds.length) throw new NotFoundError('Element');

    const results = [] as any[];
    for (const element of data.elements) {
      const existing = await db.query.resultIa01.findFirst({ where: and(eq(ia01RowTable.headerId, header.id), eq(ia01RowTable.elementDetailId, Number(element.element_detail_id))) });
      if (existing) {
        await db.update(ia01RowTable)
          .set({ isCompetent: element.is_competent, evaluation: element.evaluation })
          .where(eq(ia01RowTable.id, existing.id));
        const updated = await db.query.resultIa01.findFirst({ where: eq(ia01RowTable.id, existing.id) });
        if (updated) results.push(updated);
      } else {
        const inserted = await db.insert(ia01RowTable).values({
          headerId: header.id,
          elementDetailId: Number(element.element_detail_id),
          isCompetent: element.is_competent,
          evaluation: element.evaluation,
        });
        const created = await db.query.resultIa01.findFirst({ where: and(eq(ia01RowTable.headerId, header.id), eq(ia01RowTable.elementDetailId, Number(element.element_detail_id))) });
        if (created) results.push(created);
      }
    }
        return results;
    }

    static async sendResultHeader(data: AssessorApproveRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!existingResult) throw new NotFoundError('Result');

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, data.result_id) });
    if (!header) throw new NotFoundError('IA01 header');

    await db.update(ia01HeaderTable).set({
      isCompetent: data.is_competent,
      group: data.group as any,
      unit: data.unit as any,
      element: data.element as any,
      kuk: data.kuk as any,
    }).where(eq(ia01HeaderTable.id, header.id));

    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

        return {
      id: updated.id,
      result_id: updated.resultId,
            assessee: {
        id: assessee?.id,
        name: assesseeUser?.fullName,
        email: assesseeUser?.email,
      },
      approved_assessee: updated.approvedAssessee,
      approved_assessor: updated.approvedAssessor,
      is_competent: updated.isCompetent,
      group: updated.group,
      unit: updated.unit,
      element: updated.element,
      kuk: updated.kuk,
        };
    }

    static async approvedByAssessee(resultId: number) {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, resultId) });
    if (!header) throw new NotFoundError('IA01 header');
    await db.update(ia01HeaderTable).set({ approvedAssessee: true }).where(eq(ia01HeaderTable.id, header.id));
    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');
    return updated;
    }

    static async approvedByAssessor(resultId: number) {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, resultId) });
    if (!header) throw new NotFoundError('IA01 header');
    await db.update(ia01HeaderTable).set({ approvedAssessor: true }).where(eq(ia01HeaderTable.id, header.id));
    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');
    return updated;
    }

    static async getResultDetails(resultId: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
    if (!result) throw new NotFoundError('Result');

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessmentId) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, result.id) });
    if (!header) throw new NotFoundError('Result header');

    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
      assessor: null,
      tuk: result.tuk,
      is_competent: result.isCompetent,
      created_at: result.createdAt,
      ia01_header: header,
    };
  }

  private static async getHeaderId(resultId: number): Promise<number | null> {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, resultId) });
    return header?.id ?? null;
  }
}