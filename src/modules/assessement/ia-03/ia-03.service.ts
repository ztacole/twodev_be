import { prisma } from "../../../config/db";
import { NotFoundError } from "../../../common/error";
import { GroupIA03Response, SendResultRequest } from "./ia-03.type";

export class IA03Service {
    static async getIA03Groups(resultId: number): Promise<any[]> {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                assessment: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.assessment) {
            throw new NotFoundError('Assessment');
        }

        const groups = await prisma.group_ia.findMany({
            where: {
                assessment_id: existingResult.assessment_id
            },
            include: {
                units: true,
                qa_ia03: {
                    include: {
                        rows: {
                            include: {
                                header: true
                            },
                            where: {
                                header: {
                                    result_id: resultId
                                }
                            }
                        }
                    }
                }
            }
        });
        
        return groups.map((group) => ({
            id: group.id,
            assessment_id: group.assessment_id,
            name: group.name,
            units: group.units,
            questions: group.qa_ia03.map((question, index) => ({
                id: question.id,
                question: question.question,
                result: question.rows[index] ? {
                    id: question.rows[index].id,
                    header_id: question.rows[index].header_id,
                    answer: question.rows[index].answer,
                    approved: question.rows[index].approved
                } : null
            }))
        }));
    }

    static async sendResult(data: SendResultRequest) {
        const existingResult = await prisma.result.findUnique({
            where: { id: data.result_id },
            include: {
                ia03_headers: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia03_headers) {
            throw new NotFoundError('IA03 header');
        }

        const headerId = existingResult.ia03_headers.id;

        const questions = data.questions.map(question => Number(question.question_id));
        const existingQuestions = await prisma.ia03_question.findMany({
            where: { id: { in: questions } }
        });

        if (existingQuestions.length !== questions.length) {
            throw new NotFoundError('Question');
        }

        const results = await Promise.all(
            data.questions.map(async (question) => {
                return await prisma.$transaction(async (tx) => {
                    const resultRecord = await tx.result_ia03.upsert({
                        where: {
                            header_id_question_id: {
                                header_id: headerId,
                                question_id: question.question_id
                            }
                        },
                        update: {
                            answer: question.answer,
                            approved: question.approved
                        },
                        create: {
                            header_id: headerId,
                            question_id: question.question_id,
                            answer: question.answer,
                            approved: question.approved
                        }
                    });
                    return resultRecord;
                });
            })
        );

        return results;
    }

    static async approvedByAssessor(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia03_headers: true
            }
        })
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia03_headers) {
            throw new NotFoundError('IA03 header');
        }

        const headerId = existingResult.ia03_headers.id;

        const update = await prisma.result_ia03_header.update({
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
        });

        return {
            id: update.id,
            result_id: update.result_id,
            assessee: {
                id: update.result.assessee.id,
                name: update.result.assessee.user.full_name,
                email: update.result.assessee.user.email
            },
            approved_assessee: update.approved_assessee,
            approved_assessor: update.approved_assessor
        };
    }

    static async approvedByAssessee(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia03_headers: true
            }
        })
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia03_headers) {
            throw new NotFoundError('IA03 header');
        }

        const headerId = existingResult.ia03_headers.id;

        const update = await prisma.result_ia03_header.update({
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
        });

        return {
            id: update.id,
            result_id: update.result_id,
            assessee: {
                id: update.result.assessee.id,
                name: update.result.assessee.user.full_name,
                email: update.result.assessee.user.email
            },
            approved_assessee: update.approved_assessee,
            approved_assessor: update.approved_assessor
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
        ia03_headers: true
      }
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ia03_headers) {
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
      ia03_header: result.ia03_headers
    };
  }
}