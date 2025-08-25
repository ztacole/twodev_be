import { prisma } from '../../../config/db';
import { AK04Request, AK04Response } from './ak-04.type';
import { NotFoundError } from '../../../common/error';

export class AK04Service {
  static async createAK04(data: AK04Request): Promise<AK04Response> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id } });
    if (!result) throw new NotFoundError('Result');
    const saved = await prisma.result_ak04.upsert({
      where: { result_id: data.result_id },
      update: {
        approved_assessee: data.approved_assessee,
        q1_yes: data.q1_yes,
        q2_yes: data.q2_yes,
        q3_yes: data.q3_yes,
        reason: data.reason ?? ''
      },
      create: {
        result_id: data.result_id,
        approved_assessee: data.approved_assessee,
        q1_yes: data.q1_yes,
        q2_yes: data.q2_yes,
        q3_yes: data.q3_yes,
        reason: data.reason ?? ''
      }
    });

    return saved as unknown as AK04Response;
  }

  static async getAK04ByResultId(resultId: number): Promise<AK04Response> {
    const record = await prisma.result_ak04.findFirst({ where: { result_id: resultId } });
    if (!record) throw new NotFoundError('AK04');
    return record as unknown as AK04Response;
  }
}
