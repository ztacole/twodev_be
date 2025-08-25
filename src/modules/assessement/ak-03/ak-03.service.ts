import { prisma } from '../../../config/db';
import { AK03Request, AK03Response } from './ak-03.type';
import { NotFoundError } from '../../../common/error';

export class AK03Service {
  static async createAK03(data: AK03Request): Promise<AK03Response> {
    const result = await prisma.result.findUnique({ where: { id: data.result_id } });
    if (!result) throw new NotFoundError('Result');

    const header = await prisma.result_ak03_header.create({
      data: {
        result_id: data.result_id,
        comment: data.comment ?? null,
      },
    });

    const rows = await prisma.$transaction(
      data.items.map(item =>
        prisma.result_ak03.create({
          data: {
            header_id: header.id,
            component: item.component,
            is_ok: item.is_ok,
            comment: item.comment ?? null,
          },
        })
      )
    );

    const fullHeader = await prisma.result_ak03_header.findUnique({
      where: { id: header.id },
      include: { rows: true },
    });

    return formatAK03Response(fullHeader!);
  }

  static async getAK03ByResultId(result_id: number): Promise<AK03Response | null> {
    const header = await prisma.result_ak03_header.findUnique({
      where: { result_id },
      include: { rows: true },
    });
    return header ? formatAK03Response(header) : null;
  }
}

function formatAK03Response(header: any): AK03Response {
  return {
    id: header.id,
    result_id: header.result_id,
    comment: header.comment,
    rows: header.rows.map((row: any) => ({
      id: row.id,
      header_id: row.header_id,
      component: row.component,
      is_ok: row.is_ok,
      comment: row.comment,
    })),
  };
}
