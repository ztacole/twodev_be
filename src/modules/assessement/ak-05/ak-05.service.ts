import { prisma } from '../../../config/db';
import { AK05Request, AK05Response } from './ak-05.type';
import { NotFoundError } from '../../../common/error';

export class AK05Service {
  static async createAK05(data: AK05Request): Promise<AK05Response[]> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id } });
    if (!result) throw new NotFoundError('Result');

    const upserted = await prisma.result_ak05.upsert({
      where: { result_id: data.result_id },
      update: {
        is_competent: data.items[0]?.is_competent ?? false,
        description: data.items[0]?.description,
        negative_positive_aspects: data.items[0]?.negative_positive_aspects,
        rejection_notes: data.items[0]?.rejection_notes,
        improvement_suggestions: data.items[0]?.improvement_suggestions,
        approved_assessor: data.items[0]?.approved_assessor ?? false
      },
      create: {
        result_id: data.result_id,
        is_competent: data.items[0]?.is_competent ?? false,
        description: data.items[0]?.description ?? null,
        negative_positive_aspects: data.items[0]?.negative_positive_aspects ?? null,
        rejection_notes: data.items[0]?.rejection_notes ?? null,
        improvement_suggestions: data.items[0]?.improvement_suggestions ?? null,
        approved_assessor: data.items[0]?.approved_assessor ?? false
      }
    });

    return [upserted];
  }
}

