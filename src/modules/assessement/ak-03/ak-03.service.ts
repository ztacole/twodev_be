import { prisma } from '../../../config/db';
import { AK03Request, AK03Response } from './ak-03.type';
import { NotFoundError } from '../../../common/error';

export class AK03Service {
  static async createAK03(data: AK03Request): Promise<AK03Response[]> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id } });
    if (!result) throw new NotFoundError('Result');

    const upserted = await prisma.result_ak03.upsert({
      where: { result_id: data.result_id },
      update: {
        component: data.items[0]?.component ?? '',
        is_ok: data.items[0]?.is_ok ?? false,
        comment: data.items[0]?.comment
      },
      create: {
        result_id: data.result_id,
        component: data.items[0]?.component ?? '',
        is_ok: data.items[0]?.is_ok ?? false,
        comment: data.items[0]?.comment
      }
    });

    return [upserted];
  }
}
