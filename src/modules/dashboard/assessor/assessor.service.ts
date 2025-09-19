import { db } from '../../../config/drizzle';
import { DashboardAssessorResponse } from './assessor.type';
import { NotFoundError, ValidationError } from '../../../common/error';
import { result as resultTable, user as userTable, assessee as assesseeTable, resultApl02Header as apl02HeaderTable, resultIa02Header as ia02HeaderTable, resultIa05Header as ia05HeaderTable, resultAk01Header as ak01HeaderTable, resultDoc as resultDocTable, resultIa03Header as resultIa03HeaderTable, resultIa01Header as resultIa01HeaderTable, resultIa07Header as resultIa07HeaderTable, resultAk02Header as resultAk02HeaderTable, resultAk03Header, resultAk04, resultAk05 } from '../../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class DashboardAssessorService {
    static async getAssesseeData(assessor_id: number, assessment_id: number, type: string): Promise<any[]> {
        const results = await db.select().from(resultTable).where(and(eq(resultTable.assessor_id, assessor_id), eq(resultTable.assessment_id, assessment_id)));

        return Promise.all(results.map(async (result) => {
            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
            const user = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
            const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.id, result.id) });
            const apl02 = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result.id) });
            const ia01 = await db.query.resultIa02Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, result.id) });
            const ia02 = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.result_id, result.id) });
            const ia03 = await db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, result.id) });
            const ia05 = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, result.id) });
            const ia07 = await db.query.resultIa07Header.findFirst({ where: eq(resultIa07HeaderTable.result_id, result.id) });
            const ak01 = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result.id) });
            const ak02 = await db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, result.id) });
            const ak03 = await db.query.resultAk03Header.findFirst({ where: eq(resultAk03Header.result_id, result.id) });
            const ak04 = await db.query.resultAk04.findFirst({ where: eq(resultAk04.id, result.id) });
            const ak05 = await db.query.resultAk05.findFirst({ where: eq(resultAk05.result_id, result.id) });

            const getHeaderStatus = (type: string): 'Belum Selesai' | 'Menunggu Asesi' | 'Selesai' => {
                switch (type) {
                    case "apl-01":
                        return 'Selesai';
                    case "data-sertifikasi":
                        return doc?.approved ? 'Selesai' : 'Belum Selesai';
                    case "apl-02":
                        return (apl02?.approved_assessor && apl02?.approved_assessee) ? 'Selesai' : (apl02?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ia-01":
                        return (ia01?.approved_assessee && ia01?.approved_assessor) ? 'Selesai' : (ia01?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ia-02":
                        return (ia02?.approved_assessee && ia02?.approved_assessor) ? 'Selesai' : (ia02?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ia-03":
                        return (ia03?.approved_assessee && ia03?.approved_assessor) ? 'Selesai' : (ia03?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ia-05":
                        return (ia05?.approved_assessee && ia05?.approved_assessor) ? 'Selesai' : (ia05?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ia-07":
                        return (ia07?.approved_assessee && ia07?.approved_assessor) ? 'Selesai' : (ia07?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ak-01":
                        return (ak01?.approved_assessee && ak01?.approved_assessor) ? 'Selesai' : (ak01?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ak-02":
                        return (ak02?.approved_assessee && ak02?.approved_assessor) ? 'Selesai' : (ak02?.approved_assessor) ? 'Menunggu Asesi' : 'Belum Selesai';
                    case "ak-03":
                        return ak03?.comment ? 'Selesai' : 'Menunggu Asesi';
                    // case "ak-04":
                    //     return false;
                    case "ak-05":
                        return (ak05?.approved_assessor) ? 'Selesai' : 'Belum Selesai';
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
