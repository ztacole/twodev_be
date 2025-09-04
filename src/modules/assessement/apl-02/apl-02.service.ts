import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { ElementResponse, GenerateAsssessorRequest, ElementRequest, ResultRequest } from './apl-02.type';

export class APL02Service {
  static async getUnitsAPL02(resultId: number): Promise<any[]> {
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

    const unitCompetencies = await prisma.uc_apl02.findMany({
      where: {
        assessment_id: existingResult.assessment.id
      },
      include: {
        elements: {
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

    return unitCompetencies.map(unit => {
      const totalElements = unit.elements.length;
      const completedElements = unit.elements.filter(element =>
        element.results.some(result =>
          result.header.result_id === resultId
        )
      ).length;

      const finished = totalElements > 0 && completedElements === totalElements;

      return {
        id: unit.id,
        unit_code: unit.unit_code,
        title: unit.title,
        finished: finished,
        progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
        total_elements: totalElements,
        completed_elements: completedElements
      };
    });
  }

  static async getElementsByUnitId(resultId: number, unitId: number): Promise<any[]> {
    const existingUc = await prisma.uc_apl02.findUnique({
      where: { id: unitId }
    });
    if (!existingUc) {
      throw new NotFoundError('Unit competency');
    }

    const existingResult = await prisma.result.findUnique({
      where: { id: resultId }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const elements = await prisma.element_apl02.findMany({
      where: { uc_id: unitId },
      include: {
        details: true,
        results: {
          include: {
            header: true,
            evidences: true
          },
          where: {
            header: {
              result_id: resultId
            }
          }
        }
      }
    });

    return elements.map((element) => {
      const result = element.results[0];
      return {
        id: element.id,
        uc_id: element.uc_id,
        title: element.title,
        details: element.details.map((detail) => {
          return {
            id: detail.id,
            description: detail.description
          };
        }),
        result: result ? {
          id: result.id,
          header_id: result.result_apl02_id,
          element_id: result.element_id,
          is_competent: result.is_competent,
          evidences: result.evidences.map(evidence => ({
            id: evidence.id,
            evidence: evidence.evidence
          }))
        } : null
      }
    });
  }

  static async sendResult(data: ElementRequest) {
    const existingResult = await prisma.result.findUnique({
      where: { id: Number(data.result_id) },
      include: {
        apl02_headers: true
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    if (!existingResult.apl02_headers) {
      throw new NotFoundError('APL02 header');
    }

    const headerId = existingResult.apl02_headers.id;

    const elements = data.elements.map(element => Number(element.element_id));
    const existingElements = await prisma.element_apl02.findMany({
      where: { id: { in: elements } }
    });

    if (existingElements.length !== elements.length) {
      throw new NotFoundError('Element');
    }

    const results = await Promise.all(
      data.elements.map(async (element) => {
        return await prisma.$transaction(async (tx) => {
          const resultRecord = await tx.result_apl02.upsert({
            where: {
              result_apl02_id_element_id: {
                result_apl02_id: Number(headerId),
                element_id: Number(element.element_id)
              }
            },
            update: {
              is_competent: element.is_competent,
              updated_at: new Date(),
              evidences: {
                deleteMany: {},
                createMany: {
                  data: element.evidences.map(evidence => ({
                    evidence: evidence.evidence
                  }))
                }
              }
            },
            create: {
              result_apl02_id: Number(data.result_id),
              element_id: Number(element.element_id),
              is_competent: element.is_competent,
              evidences: {
                createMany: {
                  data: element.evidences.map(evidence => ({
                    evidence: evidence.evidence
                  }))
                }
              }
            }
          });

          return await tx.result_apl02.findUnique({
            where: { id: resultRecord.id },
            include: { evidences: true }
          });
        });
      })
    );

    return results;
  }

  static async sendResultHeader(data: ResultRequest) {
    const existingResult = await prisma.result.findUnique({
      where: { id: data.result_id },
      include: {
        apl02_headers: true
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    if (!existingResult.apl02_headers) {
      throw new NotFoundError('APL02 header');
    }

    const headerId = existingResult.apl02_headers.id;

    const update = await prisma.result_apl02_header.update({
      where: { id: headerId },
      data: {
        is_continue: data.is_continue,
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

    return update;
  }

  static async getUnitsResult(resultId: number) {
    const existingResult = await prisma.result.findFirst({
      where: {
        id: resultId
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const unitsResult = await prisma.result_apl02_header.findMany({
      where: {
        result_id: resultId
      },
      include: {
        result: {
          include: {
            assessee: {
              include: {
                user: true
              }
            },
            assessment: {
              include: {
                uc_apl02s: true
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 1
    });

    if (!unitsResult) {
      throw new NotFoundError('Units result');
    }

    const unitResult = unitsResult[0];

    return {
      id: unitResult.id,
      result_id: unitResult.result_id,
      assessee: {
        id: unitResult.result.assessee_id,
        name: unitResult.result.assessee.user.full_name,
        email: unitResult.result.assessee.user.email
      },
      approved_assessee: unitResult.approved_assessee,
      approved_assessor: unitResult.approved_assessor,
      is_continue: unitResult.is_continue,
      units: unitResult.result.assessment.uc_apl02s.map(unit => ({
        id: unit.id,
        unit_code: unit.unit_code,
        title: unit.title
      }))
    };
  }

  static async getElementsResult(resultId: number, unitId: number) {
    const existingUnit = await prisma.uc_apl02.findUnique({
      where: { id: unitId }
    });
    if (!existingUnit) {
      throw new NotFoundError('Unit competency');
    }

    const existingResult = await prisma.result.findFirst({
      where: {
        id: resultId
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const elementsResult = await prisma.result_apl02_header.findMany({
      where: {
        result_id: resultId,
        rows: {
          some: {
            element: {
              uc_id: unitId
            }
          }
        }
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
        },
        rows: {
          include: {
            element: {
              include: {
                details: true
              }
            },
            evidences: true
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 1
    });

    if (!elementsResult) {
      throw new NotFoundError('Elements result');
    }

    const elementResult = elementsResult[0];

    return {
      id: elementResult.id,
      result_id: elementResult.result_id,
      assessee: {
        id: elementResult.result.assessee_id,
        name: elementResult.result.assessee.user.full_name,
        email: elementResult.result.assessee.user.email
      },
      approved_assessee: elementResult.approved_assessee,
      approved_assessor: elementResult.approved_assessor,
      is_continue: elementResult.is_continue,
      results: elementResult.rows.map(element => ({
        id: element.id,
        element: element.element,
        is_competent: element.is_competent,
        evidences: element.evidences
      }))
    };
  }

  static async approvedByAssessor(resultId: number, data: GenerateAsssessorRequest) {
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        apl02_headers: true
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    if (!existingResult.apl02_headers) {
      throw new NotFoundError('APL02 header');
    }

    const headerId = existingResult.apl02_headers.id;

    const update = await prisma.result_apl02_header.update({
      where: { id: headerId },
      data: {
        approved_assessor: true,
        is_continue: data.reccomendation
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
        id: update.result.assessee_id,
        name: update.result.assessee.user.full_name,
        email: update.result.assessee.user.email
      },
      approved_assessee: update.approved_assessee,
      approved_assessor: update.approved_assessor,
      is_continue: update.is_continue
    }
  }

  static async approvedByAssessee(resultId: number) {
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        apl02_headers: true
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    if (!existingResult.apl02_headers) {
      throw new NotFoundError('Result header');
    }

    const headerId = existingResult.apl02_headers.id;

    const update = await prisma.result_apl02_header.update({
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
        id: update.result.assessee_id,
        name: update.result.assessee.user.full_name,
        email: update.result.assessee.user.email
      },
      approved_assessee: update.approved_assessee,
      approved_assessor: update.approved_assessor,
      is_continue: update.is_continue
    }
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
        apl02_headers: true,
        docs: true
      }
    });
    if (!result) {
      throw new NotFoundError('Result');
    }
    if (!result.apl02_headers) {
      throw new NotFoundError('Result header');
    }
    if (result.docs.length < 1) {
      throw new NotFoundError('Result docs');
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
      apl02_header: result.apl02_headers,
      approved_admin: result.docs[result.docs.length - 1].approved
    };
  }
}