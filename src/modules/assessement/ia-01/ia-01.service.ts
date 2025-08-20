import { prisma } from "../../../config/db";
import { GroupIA01Response } from "./ia-01.type";

export class IA01Service {
    static async getIA01Groups(assessmentId: number): Promise<GroupIA01Response[]> {
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

    static async getElementsByUnitCode(unitCode: string) {
        const elements = await prisma.element_ia.findFirst({
            where: {
                uc: {
                    unit_code: unitCode
                }
            },
            include: {
                details: true
            }
        });

        return elements;
    }
}