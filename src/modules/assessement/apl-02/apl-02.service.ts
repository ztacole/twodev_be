import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { AssessmentRequest, AssessmentResponse, ElementResponse } from './apl-02.type';

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
}