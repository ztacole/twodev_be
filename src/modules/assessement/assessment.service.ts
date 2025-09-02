import { DuplicateEntryError, NotFoundError } from "../../common/error";
import { prisma } from "../../config/db";
import { AssessmentDetailsResponse, AssessmentRequest, AssessmentResponse } from "./assessment.type";

export class AssessmentService {
    static async createAssessment(data: AssessmentRequest) {
        const scheme = await prisma.scheme.findUnique({
            where: {
                id: data.scheme_id
            }
        });
        if (!scheme) {
            throw new NotFoundError("Scheme");
        }

        const existingAssessment = await prisma.assessment.findFirst({
            where: {
                code: data.code
            }
        });
        if (existingAssessment) {
            throw new DuplicateEntryError("Assessment code", data.code);
        }

        let occupation = await prisma.occupation.findFirst({
            where: {
                name: data.occupation_name,
                scheme_id: data.scheme_id
            }
        });

        if (!occupation) {
            occupation = await prisma.occupation.create({
                data: {
                    name: data.occupation_name,
                    scheme_id: data.scheme_id
                }
            })
        }

        // Create assessment
        const assessment = await prisma.assessment.create({
            data: {
                occupation_id: Number(occupation.id),
                code: data.code,
                uc_apl02s: {
                    create: (data.uc_apl02s ?? []).map(unit => ({
                        unit_code: unit.unit_code,
                        title: unit.title,
                        elements: {
                            create: (unit.elements ?? []).map(element => ({
                                title: element.title,
                                details: {
                                    create: (element.details ?? []).map(detail => ({
                                        description: detail.description
                                    }))
                                }
                            }))
                        }
                    }))
                },
                groups_ia01: {
                    create: (data.groups_ia01 ?? []).map(group => ({
                        name: group.name,
                        units: {
                            create: (group.units ?? []).map(unit => ({
                                unit_code: unit.unit_code,
                                title: unit.title,
                                elements: {
                                    create: (unit.elements ?? []).map(element => ({
                                        title: element.title,
                                        details: {
                                            create: (element.details ?? []).map(detail => ({
                                                description: detail.description,
                                                benchmark: detail.benchmark
                                            }))
                                        }
                                    }))
                                }
                            }))
                        }
                    }))
                },
                groups_ia02: {
                    create: (data.groups_ia02 ?? []).map(group => ({
                        name: group.name,
                        scenario: group.scenario,
                        duration: group.duration,
                        units: {
                            create: (group.units ?? []).map(unit => ({
                                unit_code: unit.unit_code,
                                title: unit.title,
                            }))
                        },
                        tools: {
                            create: (group.tools ?? []).map(tool => ({
                                name: tool.name
                            }))
                        }
                    }))
                },
                groups_ia03: {
                    create: (data.groups_ia03 ?? []).map(group => ({
                        name: group.name,
                        units: {
                            create: (group.units ?? []).map(unit => ({
                                unit_code: unit.unit_code,
                                title: unit.title,
                            }))
                        },
                        qa_ia03: {
                            create: (group.qa_ia03 ?? []).map(question => ({
                                question: question.question,
                            }))
                        }
                    }))
                },
                ia05_questions: {
                    create: (data.ia05_questions ?? []).map(question => ({
                        order: question.order,
                        question: question.question,
                        options: {
                            create: (question.options ?? []).map(option => ({
                                option: option.option,
                                is_answer: option.is_answer
                            }))
                        }
                    }))
                },
                ia07_questions: {
                    create: (data.ia07_questions ?? []).map(question => ({
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
                groups_ia01: {
                    include: {
                        units: {
                            include: {
                                elements: {
                                    include: {
                                        details: true
                                    }
                                }
                            }
                        }
                    }
                },
                groups_ia02: {
                    include: {
                        units: true,
                        tools: true
                    }
                },
                groups_ia03: {
                    include: {
                        units: true,
                        qa_ia03: true
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
                groups_ia01: {
                    include: {
                        units: {
                            include: {
                                elements: {
                                    include: {
                                        details: true
                                    }
                                }
                            }
                        }
                    }
                },
                groups_ia02: {
                    include: {
                        units: true,
                        tools: true
                    }
                },
                groups_ia03: {
                    include: {
                        units: true,
                        qa_ia03: true
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

    static async getAssessmentResultDetails(assessmentId: number, assessorId: number, assesseeId: number) {
        const results = await prisma.result.findMany({
            where: { assessment_id: assessmentId, assessor_id: assessorId, assessee_id: assesseeId },
            include: {
                assessment: {
                    include: {
                        occupation: {
                            include: {
                                scheme: true
                            }
                        }
                    }
                },
                assessee: {
                    include: {
                        user: true
                    }
                },
                assessor: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (results.length === 0) {
            throw new NotFoundError('Result');
        }

        return results.map(result => ({
            id: result.id,
            assessment: result.assessment,
            assessee: {
                id: result.assessee.id,
                name: result.assessee.user.full_name,
                email: result.assessee.user.email
            },
            assessor: {
                id: result.assessor.id,
                name: result.assessor.user.full_name,
                email: result.assessor.user.email,
                no_reg_met: result.assessor.no_reg_met
            },
            tuk: result.tuk,
            is_competent: result.is_competent,
            created_at: result.created_at
        }));
    }
}