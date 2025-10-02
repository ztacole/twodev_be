import { db } from '../../../config/drizzle';
import { DashboardSummary, DashboardSchedule, DashboardVerification } from './dashboard.type';
import { NotFoundError } from '../../../common/error';
import { user as userTable, assessment as assessmentTable, assessmentSchedule as scheduleTable, occupation as occupationTable, scheme as schemeTable, resultDoc as resultDocTable, assessee as assesseeTable } from '../../../../drizzle/schema';
import { asc, eq } from 'drizzle-orm';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const [schemes, assessments] = await Promise.all([
      db.select().from(schemeTable),
      db.select().from(assessmentTable),
      db.select().from(occupationTable),
    ]);
    const userAssessor = await db.select().from(userTable).where(eq(userTable.role_id, 2));
    const userAssessee = await db.select().from(userTable).where(eq(userTable.role_id, 3));
    
    const totalSchemes = schemes.length;
    const totalAssessments = assessments.length;
    const totalAssessors = userAssessor.length;
    const totalAssessees = userAssessee.length;

    return {
      totalSchemes,
      totalAssessments,
      totalAssessors,
      totalAssessees,
    };
  }

  static async getSchedules(): Promise<DashboardSchedule[]> {
    const schedules = await db.select().from(scheduleTable).orderBy(asc(scheduleTable.start_date)).limit(5);
    return Promise.all(schedules.map(async (s) => {
      const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, s.assessment_id) });
      const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
      const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
      return {
        id: s.id,
        assessment_id: s.assessment_id,
        schema_name: scheme?.code as any,
        occupation_name: occupation?.name as any,
        start_date: s.start_date as any,
        end_date: s.start_date as any,
      };
    }));
  }

  static async getVerificationDocs(): Promise<DashboardVerification[]> {
    const docs = await db.select().from(resultDocTable).orderBy(asc(resultDocTable.created_at)).limit(5);

    return docs.map((d) => ({
      id: d.id,
      result_id: d.result_id,
      purpose: d.purpose,
      school_report_card: d.school_report_card,
      field_work_practice_certificate: d.field_work_practice_certificate,
      student_card: d.student_card,
      family_card: d.family_card,
      id_card: d.id_card,
      approved: d.approved,
    }));
  }

  static async getDashboardData() {
    const summary = await this.getSummary();
    const schedules = await this.getSchedules();
    const docs = await this.getVerificationDocs();
    return {
      summary,
      schedules,
      docs,
    };
  }
}

