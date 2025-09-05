import { DuplicateEntryError, NotFoundError } from "../../common/error";
import { db } from "../../config/drizzle";
import {
    assessment as assessmentTable,
    occupation as occupationTable,
    scheme as schemeTable,
    ucApl02 as ucApl02Table,
    elementApl02 as elementApl02Table,
    elementDetailsApl02 as elementDetailsApl02Table,
    groupIa01 as groupIa01Table,
    groupIa02 as groupIa02Table,
    groupIa03 as groupIa03Table,
    ucIa01 as ucIa01Table,
    ucIa02 as ucIa02Table,
    ucIa03 as ucIa03Table,
    elementIa as elementIaTable,
    elementDetailsIa as elementDetailsIaTable,
    ia02Tool as ia02ToolTable,
    ia03Question as ia03QuestionTable,
    ia05Question as ia05QuestionTable,
    ia07Question as ia07QuestionTable,
    questionOption as questionOptionTable,
    result as resultTable,
} from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { AssessmentDetailsResponse, AssessmentRequest, AssessmentResponse } from "./assessment.type";

export class AssessmentService {
    static async createAssessment(data: AssessmentRequest) {
        return await db.transaction(async (tx) => {
            // Create occupation
            const [occupation] = await tx.insert(occupationTable).values({
                schemeId: data.scheme_id,
                name: data.occupation_name,
            });

            // Create assessment
            const [assessment] = await tx.insert(assessmentTable).values({
                occupationId: (occupation as any).insertId,
                code: data.code,
            });

            const assessmentId = (assessment as any).insertId;

            // Create UC APL02
            for (const uc of data.uc_apl02s) {
                const [ucApl02] = await tx.insert(ucApl02Table).values({
                    assessmentId,
                    unitCode: uc.unit_code,
                    title: uc.title,
                });

                for (const element of uc.elements) {
                    const [elementApl02] = await tx.insert(elementApl02Table).values({
                        ucId: (ucApl02 as any).insertId,
                        title: element.title,
                    });

                    for (const detail of element.details) {
                        await tx.insert(elementDetailsApl02Table).values({
                            elementId: (elementApl02 as any).insertId,
                            description: detail.description,
                        });
                    }
                }
            }

            // Create Group IA01
            for (const group of data.groups_ia01) {
                const [groupIa01] = await tx.insert(groupIa01Table).values({
                    assessmentId,
                    name: group.name,
                });

                for (const unit of group.units) {
                    const [ucIa01] = await tx.insert(ucIa01Table).values({
                        groupId: (groupIa01 as any).insertId,
                        unitCode: unit.unit_code,
                        title: unit.title,
                    });

                    for (const element of unit.elements) {
                        const [elementIa] = await tx.insert(elementIaTable).values({
                            ucId: (ucIa01 as any).insertId,
                                title: element.title,
                        });

                        for (const detail of element.details) {
                            await tx.insert(elementDetailsIaTable).values({
                                elementId: (elementIa as any).insertId,
                                description: detail.description,
                                benchmark: detail.benchmark,
                            });
                        }
                    }
                }
            }

            // Create Group IA02
            for (const group of data.groups_ia02) {
                const [groupIa02] = await tx.insert(groupIa02Table).values({
                    assessmentId,
                        name: group.name,
                        scenario: group.scenario,
                        duration: group.duration,
                });

                for (const unit of group.units) {
                    await tx.insert(ucIa02Table).values({
                        groupId: (groupIa02 as any).insertId,
                        unitCode: unit.unit_code,
                                title: unit.title,
                    });
                }

                for (const tool of group.tools) {
                    await tx.insert(ia02ToolTable).values({
                        groupId: (groupIa02 as any).insertId,
                        name: tool.name,
                    });
                }
            }

            // Create Group IA03
            for (const group of data.groups_ia03) {
                const [groupIa03] = await tx.insert(groupIa03Table).values({
                    assessmentId,
                        name: group.name,
                });

                for (const unit of group.units) {
                    await tx.insert(ucIa03Table).values({
                        groupId: (groupIa03 as any).insertId,
                        unitCode: unit.unit_code,
                                title: unit.title,
                    });
                }

                for (const question of group.qa_ia03) {
                    await tx.insert(ia03QuestionTable).values({
                        groupId: (groupIa03 as any).insertId,
                        question: question.question,
                    });
                }
            }

            // Create IA05 Questions
            for (const question of data.ia05_questions) {
                const [ia05Question] = await tx.insert(ia05QuestionTable).values({
                    assessmentId,
                    order: question.order,
                    question: question.question,
                });

                for (const option of question.options) {
                    await tx.insert(questionOptionTable).values({
                        questionId: (ia05Question as any).insertId,
                        option: option.option,
                        isAnswer: option.is_answer,
                    });
                }
            }

            // Create IA07 Questions
            for (const question of data.ia07_questions) {
                await tx.insert(ia07QuestionTable).values({
                    assessmentId,
                    question: question.question,
                    answerKey: question.answer_key,
                });
            }

            return { id: assessmentId };
        });
    }

    static async getAssessments(): Promise<AssessmentResponse[]> {
        const assessments = await db.select({
            id: assessmentTable.id,
            code: assessmentTable.code,
            occupationId: assessmentTable.occupationId,
        }).from(assessmentTable);

        const result = [];
        for (const assessment of assessments) {
            const [occupation] = await db
                .select()
                .from(occupationTable)
                .where(eq(occupationTable.id, assessment.occupationId));

            if (!occupation) continue;

            const [scheme] = await db
                .select()
                .from(schemeTable)
                .where(eq(schemeTable.id, (occupation as any).schemeId));

            result.push({
                id: assessment.id,
                code: assessment.code,
                occupation: {
                    id: (occupation as any).id,
                    name: (occupation as any).name,
                    scheme: scheme
                        ? {
                              id: (scheme as any).id,
                              code: (scheme as any).code,
                              name: (scheme as any).name,
                          }
                        : null,
                },
            });
        }

        return result as any;
    }

    static async getAssessmentById(id: number): Promise<AssessmentDetailsResponse> {
        const assessment = await db.query.assessment.findFirst({
            where: eq(assessmentTable.id, id)
        });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        // Get occupation and scheme manually (tanpa relations API)
        const [occupation] = await db
            .select()
            .from(occupationTable)
            .where(eq(occupationTable.id, assessment.occupationId));

        let scheme: any = null;
        if (occupation) {
            const [sc] = await db
                .select()
                .from(schemeTable)
                .where(eq(schemeTable.id, (occupation as any).schemeId));
            scheme = sc ?? null;
        }

        // Get all related data without complex relations
        const ucApl02s = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessmentId, id));
        const groupsIa01 = await db.select().from(groupIa01Table).where(eq(groupIa01Table.assessmentId, id));
        const groupsIa02 = await db.select().from(groupIa02Table).where(eq(groupIa02Table.assessmentId, id));
        const groupsIa03 = await db.select().from(groupIa03Table).where(eq(groupIa03Table.assessmentId, id));
        const ia05Questions = await db.select().from(ia05QuestionTable).where(eq(ia05QuestionTable.assessmentId, id));
        const ia07Questions = await db.select().from(ia07QuestionTable).where(eq(ia07QuestionTable.assessmentId, id));

        return {
            id: assessment.id,
            code: assessment.code,
            occupation: occupation
                ? {
                      ...(occupation as any),
                      scheme,
                  }
                : null,
            uc_apl02s: ucApl02s as any,
            groups_ia01: groupsIa01 as any,
            groups_ia02: groupsIa02 as any,
            groups_ia03: groupsIa03 as any,
            ia05_questions: ia05Questions as any,
            ia07_questions: ia07Questions as any,
        };
    }

    static async deleteAssessment(id: number): Promise<any> {
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, id) });
        if (!assessment) {
            throw new NotFoundError('Assessment not found');
        }

        await db.delete(assessmentTable).where(eq(assessmentTable.id, id));
        return { message: 'Assessment deleted successfully' };
    }

    static async getAssessmentResultDetails(assessmentId: number, assessorId: number, assesseeId: number) {
        const result = await db.query.result.findFirst({
            where: and(
                eq(resultTable.assessmentId, assessmentId),
                eq(resultTable.assessorId, assessorId),
                eq(resultTable.assesseeId, assesseeId)
            )
        });

        if (!result) {
            throw new NotFoundError('Result');
        }

        return result;
    }
}