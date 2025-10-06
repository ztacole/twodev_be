import { NotFoundError } from "../../../common/error";
import { AssessorApproveRequest, GroupIA01Response, SendResultRequest } from "./ia-01.type";
import { db } from "../../../config/drizzle";
import {
  assessor as assessorTable,
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
          unit_code: unit.unit_code,
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
    };
  }

  static async approvedByAssessee(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, existingResult.id) });
    if (!header) throw new NotFoundError('IA01 header');
    await db.update(ia01HeaderTable).set({ approved_assessee: true }).where(eq(ia01HeaderTable.id, header.id));
    const updated = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA01 header');
    return updated;
  }

  static async approvedByAssessor(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, existingResult.id) });
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

    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
    const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;

    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result.id) });
    if (!header) throw new NotFoundError('Result header');

    return {
      id: result.id,
      assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
      assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
      assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
      tuk: result.tuk,
      is_competent: result.is_competent,
      created_at: result.created_at,
      ia01_header: header,
    };
  }

  static async getIncompleteCriterias(result_id: number) {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result_id) });
    if (!header) throw new NotFoundError('IA01 header');
    const incompleteCriterias = await db.query.resultIa01.findMany({ where: and(eq(ia01RowTable.header_id, header.id), eq(ia01RowTable.is_competent, false)) });
    return this.buildIncompleteCriteriasTree(incompleteCriterias);
  }

  private static async buildIncompleteCriteriasTree(criterias: any[]): Promise<any[]> {

    // To get the full context, fetch all units/elements/details/groups for the assessment
    // 1. Find assessment_id from one of the criterias (all should be from the same assessment)
    let assessment_id: number | null = null;
    if (criterias.length > 0) {
      // Find unit_id from one of the criterias
      const anyCriteria = criterias[0];
      // Find element_detail, then element, then unit, then group, then assessment
      const elementDetail = await db.query.elementDetailsIa.findFirst({ where: eq(elementDetailsIaTable.id, anyCriteria.element_detail_id) });
      if (elementDetail) {
        const element = await db.query.elementIa.findFirst({ where: eq(elementIaTable.id, elementDetail.element_id) });
        if (element) {
          const unit = await db.query.ucIa01.findFirst({ where: eq(ucIa01Table.id, element.uc_id) });
          if (unit) {
            const group = await db.query.groupIa01.findFirst({ where: eq(groupIa01Table.id, unit.group_id) });
            if (group) {
              assessment_id = group.assessment_id;
            }
          }
        }
      }
    }

    // 2. Fetch all groups, units, elements, elementDetails for this assessment
    const groups = assessment_id !== null
      ? await db.select().from(groupIa01Table).where(eq(groupIa01Table.assessment_id, assessment_id))
      : [];
    const units = assessment_id !== null
      ? await db.select().from(ucIa01Table).where(inArray(ucIa01Table.group_id, groups.map(g => g.id)))
      : [];
    const elements = units.length
      ? await db.select().from(elementIaTable).where(inArray(elementIaTable.uc_id, units.map(u => u.id)))
      : [];
    const elementDetails = elements.length
      ? await db.select().from(elementDetailsIaTable).where(inArray(elementDetailsIaTable.element_id, elements.map(e => e.id)))
      : [];

    // Build maps for fast lookup
    const elementDetailMap = new Map(elementDetails.map(ed => [ed.id, ed]));
    const elementMap = new Map(elements.map(e => [e.id, e]));
    const unitMap = new Map(units.map(u => [u.id, u]));
    const groupMap = new Map(groups.map(g => [g.id, g]));

    // Build the tree
    const tree: any[] = [];
    // For global unit numbering: sort all units by id asc (or use order field if available)
    const allUnits = [...units].sort((a, b) => a.id - b.id);
    const unitNumberMap = new Map<number, number>();
    allUnits.forEach((u, idx) => unitNumberMap.set(u.id, idx + 1));
    // For criteria global numbering
    // Build a flat array of all elements (sorted by id asc)
    const allElements = [...elements].sort((a, b) => a.id - b.id);
    // For each element, build a flat array of its details (sorted by id asc)
    // Build criteriaNumberMap: element_id -> (element_detail_id -> criteriaNo),
    // where elementNumber is local to its unit (not global)
    // Build a map: unit_id -> [elements in that unit]
    const elementsByUnit = new Map<number, any[]>();
    units.forEach(u => {
      elementsByUnit.set(u.id, elements.filter(e => e.uc_id === u.id));
    });
    // Build criteriaNumberMap
    const criteriaNumberMap = new Map<number, Map<number, string>>();
    units.forEach(u => {
      const unitElements = elementsByUnit.get(u.id) || [];
      unitElements.forEach((element, elementIdx) => {
        const elementNumber = elementIdx + 1;
        const details = elementDetails.filter(ed => ed.element_id === element.id).sort((a, b) => a.id - b.id);
        const map = new Map<number, string>();
        details.forEach((detail, j) => {
          map.set(detail.id, `${elementNumber}.${j + 1}`);
        });
        criteriaNumberMap.set(element.id, map);
      });
    });

    for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
      const group = groups[groupIdx];
      const groupUnits = units.filter(u => u.group_id === group.id);
      const groupObj = {
        id: group.id,
        name: group.name,
        assessment_id: group.assessment_id,
        units: [] as any[],
      };
      for (let unitIdx = 0; unitIdx < groupUnits.length; unitIdx++) {
        const unit = groupUnits[unitIdx];
        // Global unit numbering
        const unitNo = unitNumberMap.get(unit.id) ?? null;
        const unitElements = elements.filter(e => e.uc_id === unit.id);
        const unitObj = {
          id: unit.id,
          unit_code: unit.unit_code,
          title: unit.title,
          no: unitNo?.toString() ?? null,
          elements: [] as any[],
        };
        unitElements.forEach((element, elementIdx) => {
          const elementCriterias = criterias.filter(c => {
            const ed = elementDetailMap.get(c.element_detail_id);
            return ed && ed.element_id === element.id;
          });
          // Element number is index+1 within this unit
          const elementNumber = elementIdx + 1;
          const elementObj = {
            id: element.id,
            title: element.title,
            no: elementNumber.toString(),
            criterias: elementCriterias.map((c) => {
              const ed = elementDetailMap.get(c.element_detail_id);
              const criteriaNo = ed && criteriaNumberMap.get(element.id)?.get(ed.id);
              return {
                id: c.id,
                element_detail_id: c.element_detail_id,
                no: criteriaNo,
                description: ed?.description,
                benchmark: ed?.benchmark,
                is_competent: c.is_competent,
                evaluation: c.evaluation,
              };
            })
          };
          if (elementObj.criterias.length > 0) {
            unitObj.elements.push(elementObj);
          }
        });
        if (unitObj.elements.length > 0) {
          groupObj.units.push(unitObj);
        }
      }
      if (groupObj.units.length > 0) {
        tree.push(groupObj);
      }
    }
    return tree;
  }

  private static async getHeaderId(result_id: number): Promise<number | null> {
    const header = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result_id) });
    return header?.id ?? null;
  }
}