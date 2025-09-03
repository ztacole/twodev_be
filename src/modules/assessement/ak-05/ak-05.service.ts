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
        approved_assessor: data.items[0]?.approved_assessor ?? false,
      },
      create: {
        result_id: data.result_id,
        is_competent: data.items[0]?.is_competent ?? false,
        description: data.items[0]?.description ?? null,
        negative_positive_aspects: data.items[0]?.negative_positive_aspects ?? null,
        rejection_notes: data.items[0]?.rejection_notes ?? null,
        improvement_suggestions: data.items[0]?.improvement_suggestions ?? null,
        approved_assessor: data.items[0]?.approved_assessor ?? false,
      },
    });

    if (upserted.is_competent) {
      await prisma.result.update({
        where: { id: data.result_id },
        data: { is_competent: true },
      });
    }

    return [formatAK05Response(upserted)];
  }

  static async getAK05ByResultId(result_id: number): Promise<AK05Response | null> {
    const ak05 = await prisma.result_ak05.findUnique({
      where: { result_id },
      include: {
        result: {
          include: {
            assessment: {
              include: {
                occupation: {
                  include: {
                    scheme: true
                  }
                }
              }
            },
            assessee: {
              include: {
                user: true
              }
            },
            assessor: {
              include: {
                user: true
              }
            },
            result_ak05: true
          }
        }
      }
    })

    return ak05 ? formatAK05Response(ak05) : null;
  }

  // AK-05 Approval
  static async approvedByAssessor(resultId: number): Promise<AK05Response> {
    const record = await prisma.result_ak05.update({
      where: { result_id: resultId },
      data: { approved_assessor: true, updated_at: new Date() },
    });
    if (!record) throw new NotFoundError('AK05');
    return record as unknown as AK05Response;
  }
}

function formatAK05Response(ak05: any): AK05Response {
  return {
    id: ak05.id,
    result: {
    id: ak05.result.id,
    assessment: ak05.result.assessment,
    assessee: {
      id: ak05.result.assessee.id,
      name: ak05.result.assessee.user.full_name,
      email: ak05.result.assessee.user.email,
    },
    assessor: {
      id: ak05.result.assessor.id,
      name: ak05.result.assessor.user.full_name,
      email: ak05.result.assessor.user.email,
      no_reg_met: ak05.result.assessor.no_reg_met,
    },
    tuk: ak05.result.tuk,
    created_at: ak05.result.created_at,
    result_ak05: ak05.result.result_ak05,
    },
    is_competent: ak05.is_competent,
  };
}
