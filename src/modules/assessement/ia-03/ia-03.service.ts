import { NotFoundError } from "../../../common/error";
import { GroupIA03Response, SendResultRequest } from "./ia-03.type";
import { db } from "../../../config/drizzle";
import {
  result as resultTable,
  assessment as assessmentTable,
  groupIa03 as groupIa03Table,
  ucIa03 as ucIa03Table,
  ia03Question as ia03QuestionTable,
  resultIa03Header as ia03HeaderTable,
  resultIa03 as ia03RowTable,
  assessee as assesseeTable,
  user as userTable,
  occupation as occupationTable,
  scheme as schemeTable,
} from "../../../../drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";

export class IA03Service {
    static async getIA03Groups(result_id: number): Promise<any[]> {
        const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id), });
        if (!existingResult) throw new NotFoundError('Result');
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, existingResult.assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');

        const groups = await db.select().from(groupIa03Table).where(eq(groupIa03Table.assessment_id, assessment.id));
        return Promise.all(groups.map(async (g) => {
            const units = await db.select().from(ucIa03Table).where(eq(ucIa03Table.group_id, g.id));
            const questions = await db.select().from(ia03QuestionTable).where(eq(ia03QuestionTable.group_id, g.id));
            const header = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.result_id, result_id) });
            const rows = header ? await db.select().from(ia03RowTable).where(eq(ia03RowTable.header_id, header.id)) : [];
            return {
                id: g.id,
                assessment_id: g.assessment_id,
                name: g.name,
                units,
                questions: questions.map(q => ({
                    id: q.id,
                    question: q.question,
                    result: rows.find(r => r.question_id === q.id) ? {
                        id: rows.find(r => r.question_id === q.id)!.id,
                        header_id: header?.id,
                        answer: rows.find(r => r.question_id === q.id)!.answer,
                        approved: rows.find(r => r.question_id === q.id)!.approved,
                } : null
            }))
            };
        }));
    }

    static async sendResult(data: SendResultRequest) {
        const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
        if (!existingResult) throw new NotFoundError('Result');
        const header = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.result_id, data.result_id) });
        if (!header) throw new NotFoundError('IA03 header');

        const question_ids = data.questions.map(q => Number(q.question_id));
        const existingQuestions = question_ids.length ? await db.select().from(ia03QuestionTable).where(inArray(ia03QuestionTable.id, question_ids)) : [];
        if (existingQuestions.length !== question_ids.length) throw new NotFoundError('Question');

        const results: any[] = [];
        for (const q of data.questions) {
            const existing = await db.query.resultIa03.findFirst({ where: and(eq(ia03RowTable.header_id, header.id), eq(ia03RowTable.question_id, Number(q.question_id))) });
            if (existing) {
                await db.update(ia03RowTable).set({ answer: q.answer as any, approved: q.approved }).where(eq(ia03RowTable.id, existing.id));
                const updated = await db.query.resultIa03.findFirst({ where: eq(ia03RowTable.id, existing.id) });
                if (updated) results.push(updated);
            } else {
                await db.insert(ia03RowTable).values({ header_id: header.id, question_id: Number(q.question_id), answer: q.answer as any, approved: q.approved });
                const created = await db.query.resultIa03.findFirst({ where: and(eq(ia03RowTable.header_id, header.id), eq(ia03RowTable.question_id, Number(q.question_id))) });
                if (created) results.push(created);
            }
        }
        return results;
    }

    static async approvedByAssessor(result_id: number) {
        const header = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.result_id, result_id) });
        if (!header) throw new NotFoundError('IA03 header');
        await db.update(ia03HeaderTable).set({ approved_assessor: true }).where(eq(ia03HeaderTable.id, header.id));
        const updated = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.id, header.id) });
        if (!updated) throw new NotFoundError('IA03 header');
        return updated;
    }

    static async approvedByAssessee(result_id: number) {
        const header = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.result_id, result_id) });
        if (!header) throw new NotFoundError('IA03 header');
        await db.update(ia03HeaderTable).set({ approved_assessee: true }).where(eq(ia03HeaderTable.id, header.id));
        const updated = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.id, header.id) });
        if (!updated) throw new NotFoundError('IA03 header');
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
        const header = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.result_id, result.id) });
        if (!header) throw new NotFoundError('Result header');

    return {
      id: result.id,
            assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
            assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
            assessor: null,
      tuk: result.tuk,
            is_competent: result.is_competent,
            created_at: result.created_at,
            ia03_header: header,
    };
  }
}