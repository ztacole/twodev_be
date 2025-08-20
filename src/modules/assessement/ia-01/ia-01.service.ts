import { NotFoundError } from "../../../common/error";
import { prisma } from "../../../config/db";
import { GroupIA01Response } from "./ia-01.type";

export class IA01Service {
    static async getIA01Groups(assessmentId: number): Promise<GroupIA01Response[]> {
        const existingAssessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });

        if (!existingAssessment) {
            throw new NotFoundError('Assessment');
        }

        const groups: GroupIA01Response[] = await prisma.group_ia.findMany({
            where: {
                assessment_id: assessmentId
            },
            include: {
                units: true
            }
        });

        return groups;
    }

    static async getElementsByUnitId(unitId: number) {
        const existingUnit = await prisma.uc_ia.findUnique({
            where: { id: unitId }
        });

        if (!existingUnit) {
            throw new NotFoundError('Unit competency');
        }

        const elements = await prisma.element_ia.findUnique({
            where: {
                id: unitId
            },
            include: {
                details: true
            }
        })

        if (!elements) {
            throw new NotFoundError('Element');
        }

        return elements;
    }
}