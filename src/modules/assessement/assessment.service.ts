import { DuplicateEntryError, NotFoundError } from "../../common/error";
import { prisma } from "../../config/db";
import { AssessmentDetailsResponse, AssessmentRequest, AssessmentResponse } from "./assessment.type";

export class AssessmentService {
    static async createAssessment(data: AssessmentRequest) {
        const occupation = await prisma.occupation.findUnique({
            where: {
                id: data.occupation_id
            }
        });

        if (!occupation) {
            throw new NotFoundError("Occupation");
        }

        const existingAssessment = await prisma.assessment.findFirst({
            where: {
                code: data.code
            }
        });
        if (existingAssessment) {
            throw new DuplicateEntryError("Assessment code", data.code);
        }

        // Create assessment
        const assessment = await prisma.assessment.create({
            data: {
                occupation_id: data.occupation_id,
                code: data.code,
                uc_apl02s: {
                    create: data.uc_apl02s.map(unit => ({
                        unit_code: unit.unit_code,
                        title: unit.title,
                        elements: {
                            create: unit.elements.map(element => ({
                                title: element.title,
                                details: {
                                    create: element.details.map(detail => ({
                                        description: detail.description
                                    }))
                                }
                            }))
                        }
                    }))
                },
                groups_ia: {
                    create: data.groups_ia.map(group => ({
                        name: group.name,
                        scenario: group.scenario,
                        duration: group.duration,
                        units: {
                            create: group.units.map(unit => ({
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
                            create: group.tools.map(tool => ({
                                name: tool.name
                            }))
                        }
                    }))
                },
                ia05_questions: {
                    create: data.ia05_questions.map(question => ({
                        order: question.order,
                        question: question.question,
                        options: {
                            create: question.options.map(option => ({
                                option: option.option,
                                is_answer: option.is_answer
                            }))
                        }
                    }))
                },
                ia07_questions: {
                    create: data.ia07_questions.map(question => ({
                        question: question.question,
                        answer_key: question.answer_key
                    }))
                }
            },
            include: {
                occupation: true,
                uc_apl02s: {
                    include: {
                        elements: {
                            include: {
                                details: true
                            }
                        }
                    }
                },
                groups_ia: {
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
                },
                ia05_questions: {
                    include: {
                        options: true
                    }
                },
                ia07_questions: true
            }
        });

        return assessment;
    }

    static async getAssessments(): Promise<AssessmentResponse[]> {
        const assessments: AssessmentResponse[] = await prisma.assessment.findMany({
            include: {
                occupation: {
                    include: {
                        scheme: true
                    }
                }
            }
        });

        return assessments;
    }

    static async getAssessmentById(id: number): Promise<AssessmentDetailsResponse> {
        const assessment: AssessmentDetailsResponse | null = await prisma.assessment.findUnique({
            where: { id },
            include: {
                occupation: {
                    include: {
                        scheme: true
                    }
                },
                uc_apl02s: {
                    include: {
                        elements: {
                            include: {
                                details: true
                            }
                        }
                    }
                },
                groups_ia: {
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
                },
                ia05_questions: {
                    include: {
                        options: true
                    }
                },
                ia07_questions: true
            }
        });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        return assessment;
    }

    static async deleteAssessment(id: number): Promise<any> {
        const existingAssessment = await prisma.assessment.findUnique({
            where: { id }
        });

        if (!existingAssessment) {
            throw new NotFoundError('Assessment not found');
        }

        return prisma.assessment.delete({
            where: { id }
        });
    }
}