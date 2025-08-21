import { prisma } from '../../../config/db';
import { DashboardAssessorResponse } from './assessor.type';
import { NotFoundError } from '../../../common/error';

export class DashboardAssessorService {
    static async getAssessmentMandiriByAssessor(assessorId: number): Promise<DashboardAssessorResponse[]> {
        const results = await prisma.result.findMany({
            where: { assessor_id: assessorId },
            include: {
                assessee: {
                    include: { user: true },
                },
                assessment: true,
                apl02_headers: true,
            },
        });

        if (!results || results.length === 0) {
            throw new NotFoundError('Assessment mandiri tidak ditemukan untuk assessor ini');
        }

        return results.map(this.formatMandiriResult);
    }

    static async getPenilaianByAssessor(assessorId: number): Promise<DashboardAssessorResponse[]> {
        const results = await prisma.result.findMany({
            where: { assessor_id: assessorId },
            include: {
                assessee: {
                    include: { user: true },
                },
                assessment: true,
                ia01_headers: true,
                ia03_headers: true,
                ia05_headers: true,
                ia07_headers: true,
                ak01_headers: true,
                ak02_headers: true,
            },
        });

        if (!results || results.length === 0) {
            throw new NotFoundError('Penilaian tidak ditemukan untuk assessor ini');
        }

        return results.map(this.formatPenilaianResult);
    }

    private static formatMandiriResult = (r: any): DashboardAssessorResponse => ({
        result_id: r.id,
        assessee_id: r.assessee_id,
        full_name: r.assessee.user.full_name,
        assessment_code: r.assessment.code,
        assessment_name: r.assessment.occupation_id,
        apl02_completed: r.apl02_headers.length > 0,
        ia01_completed: false,
        ia03_completed: false,
        ia05_completed: false,
        ia07_completed: false,
        ak01_completed: false,
        ak02_completed: false,
    });

    private static formatPenilaianResult = (r: any): DashboardAssessorResponse => ({
        result_id: r.id,
        assessee_id: r.assessee_id,
        full_name: r.assessee.user.full_name,
        assessment_code: r.assessment.code,
        assessment_name: r.assessment.occupation_id,
        apl02_completed: false,
        ia01_completed: r.ia01_headers.length > 0,
        ia03_completed: r.ia03_headers.length > 0,
        ia05_completed: r.ia05_headers.length > 0,
        ia07_completed: r.ia07_headers.length > 0,
        ak01_completed: r.ak01_headers.length > 0,
        ak02_completed: r.ak02_headers.length > 0,
    });
}
