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
        approved_assessee: data.approved_assessee ?? false,
        q1_yes: data.q1_yes,
        q2_yes: data.q2_yes,
        q3_yes: data.q3_yes,
        reason: data.reason ?? ''
      },
      create: {
        result_id: data.result_id,
        approved_assessee: data.approved_assessee ?? false,
        q1_yes: data.q1_yes,
        q2_yes: data.q2_yes,
        q3_yes: data.q3_yes,
        reason: data.reason ?? ''
      }
    });

    return saved as unknown as AK04Response;
  }

  static async getResultDetails(resultId: number) {
    const result = await prisma.result.findUnique({
    where: { id: resultId },
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
    });
    if (!result) {
    throw new NotFoundError('Result');
    }
    if (!result.result_ak05) {
    throw new NotFoundError('Result header');
    }

    return {
    id: result.id,
    assessment: result.assessment,
    assessee: {
        id: result.assessee.id,
        name: result.assessee.user.full_name,
        email: result.assessee.user.email
    },
    assessor: {
        id: result.assessor.id,
        name: result.assessor.user.full_name,
        email: result.assessor.user.email,
        no_reg_met: result.assessor.no_reg_met
    },
    tuk: result.tuk,
    is_competent: result.is_competent,
    created_at: result.created_at,
    result_ak05: result.result_ak05
    };
  }

  // AK-04 Approval
  static async approvedByAssessee(resultId: number): Promise<AK04Response> {
    const record = await prisma.result_ak04.update({
      where: { result_id: resultId },
      data: { approved_assessee: true, updated_at: new Date() },
    });
    if (!record) throw new NotFoundError('AK04');
    return record as unknown as AK04Response;
  }
}
