import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { ElementResponse, GenerateAsssessorRequest, ResultHeaderRequest } from './apl-02.type';

export class APL02Service {
  static async getUnitsAPL02(assessmentId: number): Promise<any[]> {
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!existingAssessment) {
      throw new NotFoundError('Assessment');
    }

    const unitCompetencies = await prisma.uc_apl02.findMany({
      where: { assessment_id: assessmentId }
    });

    return unitCompetencies.map(unit => {
      return {
        id: unit.id,
        unit_code: unit.unit_code,
        title: unit.title,
      };
    })
  }

  static async getElementsByUnitId(unitId: number): Promise<ElementResponse[]> {
    const existingUc = await prisma.uc_apl02.findUnique({
      where: { id: unitId }
    });

    if (!existingUc) {
      throw new NotFoundError('Unit competency');
    }

    const elements: ElementResponse[] = await prisma.element_apl02.findMany({
      where: { uc_id: unitId },
      include: {
        details: true
      }
    });

    return elements;
  }

  static async sendResult(data: ResultHeaderRequest) {
    const existingResultHeader = await prisma.result.findUnique({
      where: { id: Number(data.result_id) }
    });

    if (!existingResultHeader) {
      throw new NotFoundError('Result');
    }

    const elements = data.elements.map(element => Number(element.element_id));
    const existingElements = await prisma.element_apl02.findMany({
      where: { id: { in: elements } }
    });

    if (existingElements.length !== elements.length) {
      throw new NotFoundError('Element');
    }

    const resultHeader = await prisma.result_apl02_header.create({
      data: {
        result_id: Number(data.result_id),
        approved_assessee: true,
        approved_assessor: false,
        is_continue: false,
        rows: {
          create: data.elements.map(element => ({
            element_id: Number(element.element_id),
            is_competent: element.is_competent,
            evidences: {
              create: element.evidences.map(evidence => ({
                evidence: evidence.evidence
              }))
            }
          }))
        }
      },
      include: {
        rows: {
          include: {
            evidences: true
          }
        }
      }
    });

    return resultHeader;
  }

  static async getUnitsResult(assessorId: number, assesseeId: number, assessmentId: number) {
    const existingAssessee = await prisma.assessee.findUnique({
      where: { id: assesseeId }
    });
    if (!existingAssessee) {
      throw new NotFoundError('Assessee');
    }

    const existingAssessor = await prisma.assessor.findUnique({
      where: { id: assessorId }
    });
    if (!existingAssessor) {
      throw new NotFoundError('Assessor');
    }

    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });
    if (!existingAssessment) {
      throw new NotFoundError('Assessment');
    }

    const existingResult = await prisma.result.findFirst({
      where: {
        assessee_id: assesseeId,
        assessor_id: assessorId,
        assessment_id: assessmentId
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }
    
    const unitsResult = await prisma.result_apl02_header.findMany({
      where: {
        result: {
          assessee_id: assesseeId,
          assessor_id: assessorId,
          assessment_id: assessmentId
        }
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
      units: unitResult.result.assessment.uc_apl02s.map(unit => ({
        id: unit.id,
        unit_code: unit.unit_code,
        title: unit.title
      }))
    };
  }

  static async getElementsResult(assessorId: number, assesseeId: number, unitId: number) {
    const existingUnit = await prisma.uc_apl02.findUnique({
      where: { id: unitId }
    });
    if (!existingUnit) {
      throw new NotFoundError('Unit competency');
    }

    const existingAssessee = await prisma.assessee.findUnique({
      where: { id: assesseeId }
    });
    if (!existingAssessee) {
      throw new NotFoundError('Assessee');
    }

    const existingAssessor = await prisma.assessor.findUnique({
      where: { id: assessorId }
    });
    if (!existingAssessor) {
      throw new NotFoundError('Assessor');
    }

    const existingResult = await prisma.result.findFirst({
      where: {
        assessee_id: assesseeId,
        assessor_id: assessorId,
        assessment_id: existingUnit.assessment_id
      }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const elementsResult = await prisma.result_apl02_header.findMany({
      where: {
        result: {
          assessee_id: assesseeId,
          assessor_id: assessorId
        },
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
      results: elementResult.rows.map(element => ({
        id: element.id,
        element_id: element.element_id,
        element: element.element,
        evidences: element.evidences
      }))
    };
  }

  static async approvedByAssessor(resultId: number, data: GenerateAsssessorRequest) {
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId }
    });
    if (!existingResult) {
      throw new NotFoundError('Result');
    }

    const resultHeaders = await prisma.result_apl02_header.findMany({
      where: { result_id: resultId },
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
      },
      orderBy: { id: 'desc' },
      take: 1
    });

    if (!resultHeaders) {
      throw new NotFoundError('Result header');
    }

    const resultHeader = resultHeaders[0];

    const update = await prisma.result_apl02_header.update({
      where: { id: resultHeader.id },
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
}