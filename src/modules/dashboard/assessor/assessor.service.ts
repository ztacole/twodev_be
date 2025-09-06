import { db } from '../../../config/drizzle';
import { DashboardAssessorResponse } from './assessor.type';
import { NotFoundError, ValidationError } from '../../../common/error';
import { result as resultTable, user as userTable, assessee as assesseeTable, resultApl02Header as apl02HeaderTable, resultIa02Header as ia02HeaderTable, resultIa05Header as ia05HeaderTable, resultAk01Header as ak01HeaderTable } from '../../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class DashboardAssessorService {
    static async getAssesseeData(assessor_id: number, assessment_id: number, type: string): Promise<any[]> {
        const results = await db.select().from(resultTable).where(and(eq(resultTable.assessor_id, assessor_id), eq(resultTable.assessment_id, assessment_id)));

        return Promise.all(results.map(async (result) => {
            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
            const user = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
            const apl02 = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result.id) });
            const ia02 = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.result_id, result.id) });
            const ia05 = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, result.id) });
            const ak01 = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result.id) });

            const getHeaderStatus = (type: string) => {
                switch (type) {
                    case "apl-02":
                        return apl02?.approved_assessee ? true : false;
                    case "ia-01":
                        return true;
                    case "ia-02":
                        return ia02?.approved_assessee ? true : false;
                    case "ia-03":
                        return true;
                    case "ia-05":
                        return ia05?.approved_assessee ? true : false;
                    case "ia-05-c":
                        return ia05?.approved_assessee ? true : false;
                    case "ak-01":
                        return ak01?.approved_assessee ? true : false;
                    case "ak-02":
                        return true;
                    case "ak-03":
                        return true;
                    case "ak-04":
                        return true;
                    case "ak-05":
                        return true;
                    default:
                        throw new ValidationError('Result Type tidak valid');
                }
            };
            return {
                result_id: result.id,
                assessment_id: result.assessment_id,
                assessee_id: result.assessee_id,
                assessee_name: user?.full_name,
                status: getHeaderStatus(type),
            };
        }));
    }
}
