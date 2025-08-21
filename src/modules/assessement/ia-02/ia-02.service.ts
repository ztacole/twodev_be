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

        const groups: GroupIA02Response[] = await prisma.group_ia.findMany({
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
}