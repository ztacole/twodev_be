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
    static async getIA01Groups(result_id: number): Promise<GroupIA01Response[]> {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id), });
    if (!existingResult) throw new NotFoundError('Result');

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, existingResult.assessment_id) });
    if (!assessment) throw new NotFoundError('Assessment');

    const groups = await db.select().from(groupIa01Table).where(eq(groupIa01Table.assessment_id, assessment.id));

    const unitsByGroup = new Map<number, any[]>();
    for (const g of groups) {
      const units = await db.select().from(ucIa01Table).where(eq(ucIa01Table.group_id, g.id));
      unitsByGroup.set(g.id, units);
    }

    return Promise.all(groups.map(async (group) => {
      const units = unitsByGroup.get(group.id) || [];
      const decorated = await Promise.all(units.map(async (unit) => {
        const elements = await db.select().from(elementIaTable).where(eq(elementIaTable.uc_id, unit.id));
        let completedElements = 0;
        for (const el of elements) {
          const details = await db.select().from(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, el.id));
          const hasResult = await db.query.resultIa01.findFirst({ where: and(eq(ia01RowTable.header_id, (await IA01Service.getHeaderId(result_id))!), inArray(ia01RowTable.element_detail_id, details.map(d => d.id))) });
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
        assessment_id: group.assessment_id,
        name: group.name,
        units: decorated,
      } as GroupIA01Response;
        }));
    }

    static async getElementsByUnitId(result_id: number, unitId: number) {
    const existingUnit = await db.query.ucIa01.findFirst({ where: eq(ucIa01Table.id, unitId) });
    if (!existingUnit) throw new NotFoundError('Unit competency');

    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) throw new NotFoundError('Result');

    const elements = await db.select().from(elementIaTable).where(eq(elementIaTable.uc_id, unitId));

    const header_id = await IA01Service.getHeaderId(result_id);
    return Promise.all(elements.map(async (element) => {
      const details = await db.select().from(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, element.id));
      const rows = header_id ? await db.select().from(ia01RowTable).where(and(eq(ia01RowTable.header_id, header_id), inArray(ia01RowTable.element_detail_id, details.map(d => d.id)))) : [];
      return {
            id: element.id,
        uc_id: element.uc_id,
            title: element.title,
        details: details.map((detail) => {
          const result = rows.find(r => r.element_detail_id === detail.id);
                return {
                    id: detail.id,
                    description: detail.description,
                    benchmark: detail.benchmark,
                    result: result ? {
                        id: result.id,
              header_id: result.header_id,
              is_competent: result.is_competent,
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

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, data.result_id) });
    if (!header) throw new NotFoundError('IA01 header');

    const element_detail_ids = data.elements.map(e => Number(e.element_detail_id));
    const existingElements = element_detail_ids.length ? await db.select().from(elementDetailsIaTable).where(inArray(elementDetailsIaTable.id, element_detail_ids)) : [];
    if (existingElements.length !== element_detail_ids.length) throw new NotFoundError('Element');

    const results = [] as any[];
    for (const element of data.elements) {
      const existing = await db.query.resultIa01.findFirst({ where: and(eq(ia01RowTable.header_id, header.id), eq(ia01RowTable.element_detail_id, Number(element.element_detail_id))) });
      if (existing) {
        await db.update(ia01RowTable)
          .set({ is_competent: element.is_competent, evaluation: element.evaluation })
          .where(eq(ia01RowTable.id, existing.id));
        const updated = await db.query.resultIa01.findFirst({ where: eq(ia01RowTable.id, existing.id) });
        if (updated) results.push(updated);
      } else {
        const inserted = await db.insert(ia01RowTable).values({
          header_id: header.id,
          element_detail_id: Number(element.element_detail_id),
          is_competent: element.is_competent,
          evaluation: element.evaluation,
        });
        const created = await db.query.resultIa01.findFirst({ where: and(eq(ia01RowTable.header_id, header.id), eq(ia01RowTable.element_detail_id, Number(element.element_detail_id))) });
        if (created) results.push(created);
      }
    }
        return results;
    }

    static async sendResultHeader(data: AssessorApproveRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!existingResult) throw new NotFoundError('Result');

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, data.result_id) });
    if (!header) throw new NotFoundError('IA01 header');

    await db.update(ia01HeaderTable).set({
      is_competent: data.is_competent,
      group: data.group as any,
      unit: data.unit as any,
      element: data.element as any,
      kuk: data.kuk as any,
    }).where(eq(ia01HeaderTable.id, header.id));

    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;

        return {
      id: updated.id,
      result_id: updated.result_id,
            assessee: {
        id: assessee?.id,
        name: assesseeUser?.full_name,
        email: assesseeUser?.email,
      },
      approved_assessee: updated.approved_assessee,
      approved_assessor: updated.approved_assessor,
      is_competent: updated.is_competent,
      group: updated.group,
      unit: updated.unit,
      element: updated.element,
      kuk: updated.kuk,
        };
    }

    static async approvedByAssessee(result_id: number) {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result_id) });
    if (!header) throw new NotFoundError('IA01 header');
    await db.update(ia01HeaderTable).set({ approved_assessee: true }).where(eq(ia01HeaderTable.id, header.id));
    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');
    return updated;
    }

    static async approvedByAssessor(result_id: number) {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result_id) });
    if (!header) throw new NotFoundError('IA01 header');
    await db.update(ia01HeaderTable).set({ approved_assessor: true }).where(eq(ia01HeaderTable.id, header.id));
    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');
    return updated;
    }

    static async getResultDetails(result_id: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) throw new NotFoundError('Result');

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result.id) });
    if (!header) throw new NotFoundError('Result header');

    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
      assessor: null,
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.created_at,
      ia01_header: header,
    };
  }

  private static async getHeaderId(result_id: number): Promise<number | null> {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result_id) });
    return header?.id ?? null;
  }
}