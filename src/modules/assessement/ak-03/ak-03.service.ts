import { prisma } from '../../../config/db';
import { AK03Request, AK03Response } from './ak-03.type';
import { NotFoundError } from '../../../common/error';
import { tr } from '@faker-js/faker/.';

export class AK03Service {
  static async createAK03(data: AK03Request): Promise<AK03Response> {
    const result = await prisma.result.findUnique({
      where: { id: data.result_id },
    });
    if (!result) throw new NotFoundError('Result');

    const existingHeader = await prisma.result_ak03_header.findUnique({
      where: { result_id: data.result_id },
    });
    if (existingHeader) {
      throw new Error(
        `AK-03 with result_id ${data.result_id} already exists`
      );
    }

    const header = await prisma.result_ak03_header.create({
      data: {
        result_id: data.result_id,
        comment: data.comment ?? null,
      },
    });

    await prisma.$transaction(
      data.items.map((item) =>
        prisma.result_ak03.create({
          data: {
            header_id: header.id,
            question: item.question,
            answer: item.answer,
            comment: item.comment ?? null,
          },
        })
      )
    );

    const fullHeader = await prisma.result_ak03_header.findUnique({
      where: { id: header.id },
      include: { answers: true },
    });

    return formatAK03Response(fullHeader!);
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
        result_ak03_header: {
        include: {
            answers: true
        }
        },
        }
    });
    if (!result) {
    throw new NotFoundError('Result');
    }
    if (!result.result_ak03_header) {
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
    result_ak03: result.result_ak03_header
    };
  }
}

function formatAK03Response(header: any): AK03Response {
  return {
    id: header.id,
    result_id: header.result_id,
    comment: header.comment,
    rows: header.answers.map((row: any) => ({
      id: row.id,
      header_id: row.header_id,
      question: row.question,
      answer: row.answer,
      comment: row.comment,
    })),
  };
}
