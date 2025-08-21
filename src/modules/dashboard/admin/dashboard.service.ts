import { prisma } from '../../../config/db';
import { DashboardSummary, DashboardSchedule, DashboardVerification } from './dashboard.type';
import { NotFoundError } from '../../../common/error';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const [totalSchemes, totalAssessments, totalAssessors, totalAssessees] =
      await Promise.all([
        prisma.scheme.count(),
        prisma.assessment.count(),
        prisma.assessor.count(),
        prisma.assessee.count(),
      ]);

    return {
      totalSchemes,
      totalAssessments,
      totalAssessors,
      totalAssessees,
    };
  }

  static async getSchedules(): Promise<DashboardSchedule[]> {
    const schedules = await prisma.assessment_schedule.findMany({
      select: {
        id: true,
        assessment_id: true,
        start_date: true,
        end_date: true,
        assessment: {
          select: {
            occupation: {
              select: {
                name: true,
                scheme: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // if (!schedules || schedules.length === 0) {
    //   throw new NotFoundError('Tidak ada jadwal assessment ditemukan');
    // }

    return schedules.map((s) => ({
      id: s.id,
      assessment_id: s.assessment_id,
      schema_name: s.assessment.occupation.scheme.code,
      occupation_name: s.assessment.occupation.name,
      start_date: s.start_date,
      end_date: s.end_date,
    }));
  }

  static async getVerificationDocs(): Promise<DashboardVerification[]> {
    const docs = await prisma.result_doc.findMany({
      include: {
        result: {
          include: {
            assessee: true,
          },
        },
      },
    });

    // if (!docs || docs.length === 0) {
    //   throw new NotFoundError('Tidak ada dokumen verifikasi ditemukan');
    // }

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

