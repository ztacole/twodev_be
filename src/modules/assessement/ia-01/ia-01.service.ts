import { title } from "process";
import { DuplicateEntryError, NotFoundError } from "../../../common/error";
import { prisma } from "../../../config/db";
import { AssessorApproveRequest, GroupIA01Response, SendResultRequest } from "./ia-01.type";
import app from "../../../app";

export class IA01Service {
    static async getIA01Groups(resultId: number): Promise<GroupIA01Response[]> {
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

        const groups = await prisma.group_ia01.findMany({
            where: {
                assessment_id: existingResult.assessment.id
            },
            include: {
                units: {
                    include: {
                        elements: {
                            include: {
                                details: {
                                    include: {
                                        results: {
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
                        }
                    }
                }
            }
        });

        return groups.map((group: any) => ({
            id: group.id,
            assessment_id: group.assessment_id,
            name: group.name,
            units: group.units.map((unit: any) => {
                const totalElements = unit.elements.length;
                const completedElements = unit.elements.filter((element: any) => {
                    return element.details.some((detail: any) => detail.results.some((result: any) => result.header.result_id === resultId));
                }).length;

                const finished = totalElements > 0 && totalElements === completedElements;

                return {
                    id: unit.id,
                    unit_code: unit.unit_code,
                    title: unit.title,
                    finished: finished,
                    progress: finished ? 100 : Math.round((completedElements / totalElements) * 100)
                };
            })
        }));
    }

    static async getElementsByUnitId(resultId: number, unitId: number) {
        const existingUnit = await prisma.uc_ia01.findUnique({
            where: { id: unitId }
        });
        if (!existingUnit) {
            throw new NotFoundError('Unit competency');
        }

        const existingResult = await prisma.result.findUnique({
            where: { id: resultId }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }

        const elements = await prisma.element_ia.findMany({
            where: { uc_id: unitId },
            include: {
                details: {
                    include: {
                        results: {
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

        return elements.map((element) => ({
            id: element.id,
            uc_id: element.uc_id,
            title: element.title,
            details: element.details.map((detail: any) => {
                const result = detail.results[0];
                return {
                    id: detail.id,
                    description: detail.description,
                    benchmark: detail.benchmark,
                    result: result ? {
                        id: result.id,
                        header_id: result.header_id,
                        is_competent: detail.results.length > 0 ? result.is_competent : null,
                        evaluation: detail.results.length > 0 ? result.evaluation : null
                    } : null
                }
            })
        }))
    }

    static async sendResult(data: SendResultRequest) {
        const existingResult = await prisma.result.findUnique({
            where: { id: data.result_id },
            include: {
                ia01_headers: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia01_headers) {
            throw new NotFoundError('IA01 header');
        }

        const headerId = existingResult.ia01_headers.id;

        const elements = data.elements.map(element => Number(element.element_detail_id));
        const existingElements = await prisma.element_ia.findMany({
            where: { id: { in: elements } }
        });

        if (existingElements.length !== elements.length) {
            throw new NotFoundError('Element');
        }

        const results = await Promise.all(
            data.elements.map(async (element) => {
                return await prisma.$transaction(async (tx) => {
                    const resultRecord = await tx.result_ia01.upsert({
                        where: {
                            header_id_element_detail_id: {
                                header_id: headerId,
                                element_detail_id: element.element_detail_id
                            }
                        },
                        update: {
                            is_competent: element.is_competent,
                            evaluation: element.evaluation
                        },
                        create: {
                            header_id: headerId,
                            element_detail_id: element.element_detail_id,
                            is_competent: element.is_competent,
                            evaluation: element.evaluation
                        }
                    });
                    return resultRecord;
                });
            })
        );

        return results;
    }

    static async approvedByAssessor(resultId: number, data: AssessorApproveRequest) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia01_headers: true
            }
        })
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia01_headers) {
            throw new NotFoundError('IA01 header');
        }

        const headerId = existingResult.ia01_headers.id;

        const update = await prisma.result_ia01_header.update({
            where: { id: headerId },
            data: {
                approved_assessor: true,
                is_competent: data.is_competent,
                group: data.group,
                unit: data.unit,
                element: data.element,
                kuk: data.kuk
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
            approved_assessor: update.approved_assessor,
            is_competent: update.is_competent,
            group: update.group,
            unit: update.unit,
            element: update.element,
            kuk: update.kuk
        };
    }

    static async approvedByAssessee(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia01_headers: true
            }
        })
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia01_headers) {
            throw new NotFoundError('IA01 header');
        }

        const headerId = existingResult.ia01_headers.id;

        const update = await prisma.result_ia01_header.update({
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
            approved_assessor: update.approved_assessor,
            is_competent: update.is_competent,
            group: update.group,
            unit: update.unit,
            element: update.element,
            kuk: update.kuk
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
        ia01_headers: true
      }
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.ia01_headers) {
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
      ia01_header: result.ia01_headers
    };
  }
}