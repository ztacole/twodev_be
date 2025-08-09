import { prisma } from '../../../config/db';
import { AssessmentRequest, AssessmentResponse, ElementResponse } from './apl2.type';

export class APL2Service {
  async createAssessment(data: AssessmentRequest): Promise<AssessmentResponse> {
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

  async getAssessmentById(id: number): Promise<AssessmentResponse> {
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

    return formatAssessmentResponse(assessment);
  }

  async getAssessments(): Promise<AssessmentResponse[]> {
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

  async getUnitCompetenciesByAssessmentId(assessmentId: number): Promise<any[]> {
    const unitCompetencies = await prisma.unit_Competency.findMany({
      where: { assessment_id: assessmentId },
    });

    return unitCompetencies.map(unit => {
      return {
        id: unit.id,
        unit_code: unit.unit_code,
        title: unit.title,
      };
    })
  }

  async getElementsByUnitCompetencyId(unitCompetencyId: number): Promise<ElementResponse[]> {
    const elements = await prisma.element.findMany({
      where: { unit_competency_id: unitCompetencyId },
      include: {
        details: true
      }
    });

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