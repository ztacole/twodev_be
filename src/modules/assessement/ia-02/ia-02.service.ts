import { NotFoundError } from "../../../common/error";
import { prisma } from "../../../config/db";
import { GroupIA02Response } from "./ia-02.type";

export class IAO2Service {
    static async getIA02Groups(assessmentId: number): Promise<GroupIA02Response[]> {
        const existingAssessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });

        if (!existingAssessment) {
            throw new NotFoundError('Assessment');
        }

        const groups: GroupIA02Response[] = await prisma.group_ia02.findMany({
            where: {
                assessment_id: assessmentId
            },
            include: {
                units: true,
                tools: true
            }
        });
        
        return groups
    }

    static async approveByAssessor(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia02_headers: true
            }
        })
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia02_headers) {
            throw new NotFoundError('IA02 header');
        }

        const headerId = existingResult.ia02_headers.id;

        const update = await prisma.result_ia02_header.update({
            where: { id: headerId },
            data: {
                approved_assessor: true,
            },
            include: {
                result: {
                    include: {
                        assessee: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        })
        return {
            id: update.id,
            result_id: update.result_id,
            assessee: {
                id: update.result.assessee.id,
                name: update.result.assessee.user.full_name,
                email: update.result.assessee.user.email
            },
            approved_assessee: update.approved_assessee,
            approved_assessor: update.approved_assessor,
        };
    }

    static async approveByAssessee(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia02_headers: true
            }
        })
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia02_headers) {
            throw new NotFoundError('IA02 header');
        }

        const headerId = existingResult.ia02_headers.id;

        const update = await prisma.result_ia02_header.update({
            where: { id: headerId },
            data: {
                approved_assessee: true,
            },
            include: {
                result: {
                    include: {
                        assessee: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        })
        return {
            id: update.id,
            result_id: update.result_id,
            assessee: {
                id: update.result.assessee.id,
                name: update.result.assessee.user.full_name,
                email: update.result.assessee.user.email
            },
            approved_assessee: update.approved_assessee,
            approved_assessor: update.approved_assessor,
        };
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
        ia02_headers: true
      }
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ia02_headers) {
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
      ia02_header: result.ia02_headers
    };
  }
}