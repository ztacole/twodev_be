import { prisma } from '../../../config/db';
import { DashboardAssessorResponse } from './assessor.type';
import { NotFoundError, ValidationError } from '../../../common/error';

export class DashboardAssessorService {
    static async getAssesseeData(assessorId: number, assessmentId: number, type: string): Promise<any[]> {
        const results = await prisma.result.findMany({
            where: { assessor_id: assessorId, assessment_id: assessmentId },
            include: {
                assessee: {
                    include: { user: true },
                },
                apl02_headers: true,
                ia01_headers: true,
                ia02_headers: true,
                ia03_headers: true,
                ia05_headers: true,
                ak01_headers: true,
                ak02_headers: true,
            },
        });

        return results.map(result => {
            const getHeaderStatus = (type: string) => {
                switch (type) {
                    case "apl-02":
                        return result.apl02_headers?.approved_assessee ? true : false;
                    case "ia-01":
                        return true;
                    case "ia-02":
                        return result.ia02_headers?.approved_assessee ? true : false;
                    case "ia-03":
                        return true;
                    case "ia-05":
                        return result.ia05_headers?.approved_assessee ? true : false;
                    case "ak-01":
                        return result.ak01_headers?.approved_assessee ? true : false;
                    case "ak-02":
                        return true;
                    default:
                        throw new ValidationError('Result Type tidak valid');
                }
            };
            return {
                result_id: result.id,
                assessment_id: result.assessment_id,
                assessee_id: result.assessee_id,
                assessee_name: result.assessee.user.full_name,
                status: getHeaderStatus(type),
            };
        });
    }
}
