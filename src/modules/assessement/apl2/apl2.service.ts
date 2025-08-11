import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { AssessmentRequest, AssessmentResponse, ElementResponse } from './apl2.type';

export class APL2Service {
  static async createAssessment(data: AssessmentRequest): Promise<AssessmentResponse> {
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        code: data.code
      }
    })

    if (existingAssessment) {
      throw new DuplicateEntryError('Assessment code', data.code);
    }

    const occupation = await prisma.occupation.findUnique({
      where: {
        id: data.occupation_id
      }
    })

    if (!occupation) {
      throw new NotFoundError('Occupation');
    }

    const unitCodes = data.unit_competencies.map(unit => unit.unit_code);
    const existingUnits = await prisma.unit_Competency.findMany({
      where: {
        unit_code: { in: unitCodes }
      }
    });

    if (existingUnits.length > 0) {
      throw new DuplicateEntryError('Unit competency code', existingUnits[0].unit_code);
    }

    const assessment = await prisma.assessment.create({
      data: {
        occupation_id: data.occupation_id,
        code: data.code,
        unit_competencies: {
          create: data.unit_competencies.map(unit => ({
            unit_code: unit.unit_code,
            title: unit.title,
            elements: {
              create: unit.elements.map(element => ({
                title: element.title,
                details: {
                  create: element.element_details.map(detail => ({
                    description: detail.description
                  }))
                }
              }))
            }
          }))
        }
      },
      include: {
        occupation: {
          include: {
            scheme: true
          }
        },
        unit_competencies: {
          include: {
            elements: {
              include: {
                details: true
              }
            }
          }
        }
      }
    });

    return formatAssessmentResponse(assessment);
  }

  static async getAssessmentById(id: number): Promise<AssessmentResponse> {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        occupation: {
          include: {
            scheme: true
          }
        },
        unit_competencies: {
          include: {
            elements: {
              include: {
                details: true
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      throw new NotFoundError('Assessment');
    }

    return formatAssessmentResponse(assessment);
  }

  static async getAssessments(): Promise<AssessmentResponse[]> {
    const assessments = await prisma.assessment.findMany({
      include: {
        occupation: {
          include: {
            scheme: true
          }
        },
        unit_competencies: {
          include: {
            elements: {
              include: {
                details: true
              }
            }
          }
        }
      }
    });

    return assessments.map(formatAssessmentResponse);
  }

  static async getUnitCompetenciesByAssessmentId(assessmentId: number): Promise<any[]> {
    const unitCompetencies = await prisma.unit_Competency.findMany({
      where: { assessment_id: assessmentId },
    });

    if (!unitCompetencies) {
      throw new NotFoundError('Unit competencies');
    }

    return unitCompetencies.map(unit => {
      return {
        id: unit.id,
        unit_code: unit.unit_code,
        title: unit.title,
      };
    })
  }

  static async getElementsByUnitCompetencyId(unitCompetencyId: number): Promise<ElementResponse[]> {
    const elements = await prisma.element.findMany({
      where: { unit_competency_id: unitCompetencyId },
      include: {
        details: true
      }
    });

    if (!elements) {
      throw new NotFoundError('Elements');
    }

    return elements.map(element => {
      return {
        id: element.id,
        title: element.title,
        element_details: element.details
      };
    })
  }
}

function formatAssessmentResponse(assessment: any): AssessmentResponse {
  return {
    id: assessment.id,
    code: assessment.code,
    occupation: {
      id: assessment.occupation.id,
      name: assessment.occupation.name,
      scheme: {
        id: assessment.occupation.scheme.id,
        code: assessment.occupation.scheme.code,
        name: assessment.occupation.scheme.name
      }
    },
    unit_competencies: assessment.unit_competencies.map((unit: any) => ({
      id: unit.id,
      assessment_id: unit.assessment_id,
      unit_code: unit.unit_code,
      title: unit.title,
      elements: unit.elements.map((element: any) => ({
        id: element.id,
        unit_competency_id: element.unit_competency_id,
        title: element.title,
        element_details: element.details
      }))
    }))
  };
}