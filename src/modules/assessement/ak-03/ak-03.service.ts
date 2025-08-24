import { prisma } from '../../../config/db';
import { AK03Request, AK03Response } from './ak-03.type';
import { NotFoundError } from '../../../common/error';

export class AK03Service {
  static async createAK03(data: AK03Request): Promise<AK03Response[]> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id } });
    if (!result) throw new NotFoundError('Result');

    const created = await prisma.$transaction(
      data.items.map(item => prisma.result_ak03.create({
        data: {
          result_id: data.result_id,
          component: item.component,
          is_ok: item.is_ok,
          comment: item.comment
        }
      }))
    );

    return created;
  }
}
