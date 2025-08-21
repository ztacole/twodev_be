import { prisma } from "../../../config/db";
import { NotFoundError } from "../../../common/error";
import { GroupIA03Response } from "./ia-03.type";

export class IA03Service {
    static async getIA03Groups(assessmentId: number): Promise<GroupIA03Response[]> {
        const existingAssessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });

        if (!existingAssessment) {
            throw new NotFoundError('Assessment');
        }

        const groups = await prisma.group_ia.findMany({
            where: {
                assessment_id: assessmentId
            },
            include: {
                units: true,
                qa_ia03: true
            }
        });
        
        return groups.map((group) => ({
            id: group.id,
            assessment_id: group.assessment_id,
            name: group.name,
            units: group.units,
            questions: group.qa_ia03
        }));
    }
}