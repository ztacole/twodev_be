import { db } from '../../../config/drizzle';
import { DashboardSummary, DashboardSchedule, DashboardVerification } from './dashboard.type';
import { NotFoundError } from '../../../common/error';
import { assessment as assessmentTable, assessmentSchedule as scheduleTable, occupation as occupationTable, scheme as schemeTable, resultDoc as resultDocTable, assessee as assesseeTable } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const [schemes, assessments, assessors, assessees] = await Promise.all([
      db.select().from(schemeTable),
      db.select().from(assessmentTable),
      db.select().from(occupationTable),
      db.select().from(assesseeTable),
    ]);
    const totalSchemes = schemes.length;
    const totalAssessments = assessments.length;
    const totalAssessors = assessors.length;
    const totalAssessees = assessees.length;

    return {
      totalSchemes,
      totalAssessments,
      totalAssessors,
      totalAssessees,
    };
  }

  static async getSchedules(): Promise<DashboardSchedule[]> {
    const schedules = await db.select().from(scheduleTable);
    return Promise.all(schedules.map(async (s) => {
      const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, s.assessmentId) });
      const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
      const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;
      return {
        id: s.id,
        assessment_id: s.assessmentId,
        schema_name: scheme?.code as any,
        occupation_name: occupation?.name as any,
        start_date: s.startDate as any,
        end_date: s.endDate as any,
      };
    }));
  }

  static async getVerificationDocs(): Promise<DashboardVerification[]> {
    const docs = await db.select().from(resultDocTable);

    return docs.map((d) => ({
      id: d.id,
      result_id: d.resultId,
      purpose: d.purpose,
      school_report_card: d.schoolReportCard,
      field_work_practice_certificate: d.fieldWorkPracticeCertificate,
      student_card: d.studentCard,
      family_card: d.familyCard,
      id_card: d.idCard,
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

