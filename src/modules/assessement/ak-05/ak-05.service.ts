import { prisma } from '../../../config/db';
import { AK05Request, AK05Response } from './ak-05.type';
import { NotFoundError } from '../../../common/error';

export class AK05Service {
  static async createAK05(data: AK05Request): Promise<AK05Response[]> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id } });
    if (!result) throw new NotFoundError('Result');

    const created = await prisma.$transaction(
      data.items.map(item => prisma.result_ak05.create({
        data: {
          result_id: data.result_id,
          is_competent: item.is_competent,
          description: item.description,
          negative_positive_aspects: item.negative_positive_aspects,
          rejection_notes: item.rejection_notes,
          improvement_suggestions: item.improvement_suggestions,
          approved_assessor: item.approved_assessor
        }
      }))
    );

    return created;
  }
}

