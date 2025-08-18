import { DuplicateEntryError, NotFoundError } from "../../../common/error";
import { prisma } from "../../../config/db";
import { GroupIARequest } from "./iaGroup.type";

export class IAGroupService {
    static async createIAGroup(data: GroupIARequest) {
        const existingAssessment = await prisma.assessment.findUnique({
            where: {
                id: data.assessment_id
            }
        });
        if (!existingAssessment) {
            throw new NotFoundError('Assessment');
        }

        const unitCodes = data.units.map(unit => unit.unit_code);
        const existingUnits = await prisma.uc_ia.findMany({
            where: {
                unit_code: { in: unitCodes }
            }
        });

        if (existingUnits.length > 0) {
            throw new DuplicateEntryError('Unit competency code', existingUnits[0].unit_code);
        }

        const rawResponse = prisma.group_ia.create({
            data: {
                assessment_id: data.assessment_id,
                name: data.name,
                scenario: data.scenario,
                duration: data.duration,
                units: {
                    create: data.units.map(unit => ({
                        unit_code: unit.unit_code,
                        title: unit.title,
                        elements: {
                            create: unit.elements.map(element => ({
                                title: element.title,
                                details: {
                                    create: element.details.map(detail => ({
                                        description: detail.description,
                                        benchmark: detail.benchmark
                                    }))
                                }
                            }))
                        }
                    }))
                },
                tools: {
                    create: data.tools.map(tool => ({
                        name: tool.name
                    }))
                }
            },
            include: {
                units: {
                    include: {
                        elements: {
                            include: {
                                details: true
                            }
                        }
                    }
                },
                tools: true
            }
        });

        return rawResponse;
    }
}