import { NotFoundError } from "../../../common/error";
import { IA05QuestionResponse, IA05QuestionsAnswerResponse, SendAssesseeResultRequest, SendAssessorResultRequest } from "./ia-05.type";
import { db } from "../../../config/drizzle";
import {
  assessor as assessorTable,
  ia05Question as ia05QuestionTable,
  questionOption as questionOptionTable,
  resultIa05Header as ia05HeaderTable,
  resultIa05 as ia05RowTable,
  result as resultTable,
  assessment as assessmentTable,
  occupation as occupationTable,
  scheme as schemeTable,
  assessee as assesseeTable,
  user as userTable,
  assessmentSchedule,
} from "../../../../drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";

export class IA05Service {
  static async getQuestions(assessment_id: number): Promise<IA05QuestionResponse[]> {
    const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessment_id) });
    if (!existingAssessment) throw new NotFoundError('Assessment');

    const questions = await db.select().from(ia05QuestionTable).where(eq(ia05QuestionTable.assessment_id, assessment_id)).orderBy(ia05QuestionTable.order);
    return Promise.all(questions.map(async (q) => {
      const options = await db.select().from(questionOptionTable).where(eq(questionOptionTable.question_id, q.id));
      return {
        id: q.id,
        order: q.order,
        question: q.question,
        options: options.map(o => ({ id: o.id, option: o.option }))
      } as IA05QuestionResponse;
    }));
  }

  static async getAnswerKeys(assessment_id: number): Promise<IA05QuestionsAnswerResponse[]> {
    const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessment_id) });
    if (!existingAssessment) throw new NotFoundError('Assessment');

    const questions = await db.select().from(ia05QuestionTable).where(eq(ia05QuestionTable.assessment_id, assessment_id)).orderBy(ia05QuestionTable.order);
    return Promise.all(questions.map(async (q) => {
      const answer = await db.query.questionOption.findFirst({ where: and(eq(questionOptionTable.question_id, q.id), eq(questionOptionTable.is_answer, true)) });
      return {
        id: q.id,
        order: q.order,
        question: q.question,
        answer: answer ? { id: answer.id, option: answer.option } : undefined
      } as IA05QuestionsAnswerResponse;
    }));
  }

  static async getAssesseeAnswers(result_id: number): Promise<any[]> {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id), });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, result_id) });
    if (!header) throw new NotFoundError('IA05 header');

    const answers = await db.select().from(ia05RowTable).where(eq(ia05RowTable.header_id, header.id));

    const mapped = [] as any[];
    for (const row of answers) {
      const option = await db.query.questionOption.findFirst({ where: eq(questionOptionTable.id, row.option_id) });
      if (!option) continue;
      const question = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.id, option.question_id) });
      if (!question) continue;
      mapped.push({
        id: question.id,
        order: question.order,
        question: question.question,
        answers: { id: option.id, option: option.option, approved: row.approved }
      });
    }
    return mapped;
  }

  static async sendAssesseeResult(data: SendAssesseeResultRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, data.result_id) });
    if (!header) throw new NotFoundError('IA05 header');

    const option_ids = data.answers.map(a => Number(a.option_id));
    const options = option_ids.length ? await db.select().from(questionOptionTable).where(inArray(questionOptionTable.id, option_ids)) : [];
    if (options.length !== option_ids.length) throw new NotFoundError('Option');

    const existingRows = await db.select().from(ia05RowTable).where(eq(ia05RowTable.header_id, header.id));

    const results: any[] = [];
    for (const answer of data.answers) {
      const selected = options.find(o => o.id === answer.option_id);
      if (!selected) throw new NotFoundError(`Option ${answer.option_id}`);
      // Find existing row by question (through option)
      let existingForQuestion: number | null = null;
      for (const r of existingRows) {
        const opt = await db.query.questionOption.findFirst({ where: eq(questionOptionTable.id, r.option_id) });
        if (opt && opt.question_id === selected.question_id) { existingForQuestion = r.id; break; }
      }
      if (existingForQuestion) {
        await db.update(ia05RowTable).set({ option_id: answer.option_id }).where(eq(ia05RowTable.id, existingForQuestion));
        const updated = await db.query.resultIa05.findFirst({ where: eq(ia05RowTable.id, existingForQuestion) });
        if (updated) results.push(updated);
      } else {
        await db.insert(ia05RowTable).values({ header_id: header.id, option_id: answer.option_id, approved: selected.is_answer });
        const created = await db.query.resultIa05.findFirst({ where: and(eq(ia05RowTable.header_id, header.id), eq(ia05RowTable.option_id, answer.option_id)) });
        if (created) results.push(created);
      }
    }
    return results;
  }

  static async sendAssessorResult(data: SendAssessorResultRequest) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, data.result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, data.result_id) });
    if (!header) throw new NotFoundError('IA05 header');

    await db.update(ia05HeaderTable).set({
      is_achieved: data.is_achieved,
      unit: data.unit as any,
      element: data.element as any,
      kuk: data.kuk as any,
    }).where(eq(ia05HeaderTable.id, header.id));

    const results: any[] = [];
    for (const r of data.results) {
      const row = await db.query.resultIa05.findFirst({ where: and(eq(ia05RowTable.header_id, header.id), eq(ia05RowTable.option_id, r.option_id)) });
      if (row) {
        await db.update(ia05RowTable).set({ approved: r.approved }).where(eq(ia05RowTable.id, row.id));
        const updated = await db.query.resultIa05.findFirst({ where: eq(ia05RowTable.id, row.id) });
        if (updated) results.push(updated);
      }
    }

    const updatedHeader = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.id, header.id) });
    return updatedHeader;
  }

  static async approvedByAssessor(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, existingResult.id) });
    if (!header) throw new NotFoundError('IA05 header');
    await db.update(ia05HeaderTable).set({ approved_assessor: true }).where(eq(ia05HeaderTable.id, header.id));
    const updated = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA05 header');
    return updated;
  }

  static async approvedByAssessee(result_id: number) {
    const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!existingResult) throw new NotFoundError('Result');
    const header = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, existingResult.id) });
    if (!header) throw new NotFoundError('IA05 header');
    await db.update(ia05HeaderTable).set({ approved_assessee: true }).where(eq(ia05HeaderTable.id, header.id));
    const updated = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.id, header.id) });
    if (!updated) throw new NotFoundError('IA05 header');
    return updated;
  }

  static async getResultDetails(result_id: number) {
    const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
    if (!result) throw new NotFoundError('Result');

    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentSchedule.id, result.schedule_id) });
    if (!schedule) throw new NotFoundError('Schedule');

    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;

    const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
    const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;

    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
    const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;

    const header = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, result.id) });
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
      ia05_header: header,
    };
  }
}