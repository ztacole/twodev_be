import { prisma } from "../../../config/db";
import { NotFoundError } from "../../../common/error";
import { IA05QuestionResponse, IA05QuestionsAnswerResponse, SendAssesseeResultRequest, SendAssessorResultRequest } from "./ia-05.type";
import app from "../../../app";

export class IA05Service {
    static async getQuestions(assessmentId: number): Promise<IA05QuestionResponse[]> {
        const existingAssessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });

        if (!existingAssessment) {
            throw new NotFoundError('Assessment');
        }

        const questions = await prisma.ia05_question.findMany(
            {
                where: {
                    assessment_id: assessmentId
                },
                orderBy: {
                    order: 'asc'
                },
                include: {
                    options: true
                }
            }
        );

        return questions.map((question) => ({
            id: question.id,
            order: question.order,
            question: question.question,
            options: question.options.map((option) => ({
                id: option.id,
                option: option.option,
            }))
        }));
    }

    static async getAnswerKeys(assessmentId: number): Promise<IA05QuestionsAnswerResponse[]> {
        const existingAssessment = await prisma.assessment.findUnique({
            where: { id: assessmentId }
        });

        if (!existingAssessment) {
            throw new NotFoundError('Assessment');
        }

        const answers = await prisma.question_option.findMany(
            {
                where: {
                    question: {
                        assessment_id: assessmentId
                    },
                    is_answer: true
                },
                orderBy: {
                    question: {
                        order: 'asc'
                    }
                },
                include: {
                    question: true
                }
            }
        );

        return answers.map((answer) => ({
            id: answer.question.id,
            order: answer.question.order,
            question: answer.question.question,
            answer: {
                id: answer.id,
                option: answer.option
            }
        }));
    }

    static async getAssesseeAnswers(resultId: number): Promise<any[]> {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia05_headers: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia05_headers) {
            throw new NotFoundError('IA05 header');
        }

        const headerId = existingResult.ia05_headers.id;

        const answers = await prisma.result_ia05.findMany({
            where: {
                header_id: headerId
            },
            include: {
                option: {
                    include: {
                        question: true
                    }
                }
            }
        });

        return answers.map((answer) => ({
            id: answer.option.question.id,
            order: answer.option.question.order,
            question: answer.option.question.question,
            answers: answer.option.option
        }));
    }

    static async sendAssesseeResult(data: SendAssesseeResultRequest) {
        const existingResult = await prisma.result.findUnique({
            where: { id: data.result_id },
            include: {
                ia05_headers: {
                    include: {
                        rows: {
                            include: {
                                option: true
                            }
                        }
                    }
                }
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia05_headers) {
            throw new NotFoundError('IA05 header');
        }

        const headerId = existingResult.ia05_headers.id;
        const existingRows = existingResult.ia05_headers.rows;

        const optionIds = data.answers.map(answer => Number(answer.option_id));
        const existingOptions = await prisma.question_option.findMany({
            where: { id: { in: optionIds } },
            include: {
                question: true
            }
        });
        if (existingOptions.length !== optionIds.length) {
            throw new NotFoundError('Option');
        }

        const results = await Promise.all(
            data.answers.map(async (answer) => {
                const selectedOption = existingOptions.find(opt => opt.id === answer.option_id);
                if (!selectedOption) {
                    throw new NotFoundError(`Option ${answer.option_id}`);
                }

                const existingRow = existingRows.find(row =>
                    row.option.question_id === selectedOption.question_id
                );

                if (existingRow) {
                    return await prisma.result_ia05.update({
                        where: {
                            id: existingRow.id
                        },
                        data: {
                            option_id: answer.option_id,
                            updated_at: new Date()
                        }
                    });
                } else {
                    return await prisma.result_ia05.create({
                        data: {
                            header_id: headerId,
                            option_id: answer.option_id,
                            approved: false
                        }
                    });
                }
            })
        );

        return results;
    }

    static async sendAssessorResult(data: SendAssessorResultRequest) {
        const existingResult = await prisma.result.findUnique({
            where: { id: data.result_id },
            include: {
                ia05_headers: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia05_headers) {
            throw new NotFoundError('IA05 header');
        }

        const headerId = existingResult.ia05_headers.id;

        const optionIds = data.results.map(option => option.option_id);
        const existingOptions = await prisma.result_ia05.findMany({
            where: { id: { in: optionIds } }
        });
        if (existingOptions.length !== optionIds.length) {
            throw new NotFoundError('Option');
        }

        const results = await Promise.all(
            data.results.map(async (result) => {
                const update = await prisma.result_ia05.update({
                    where: {
                        header_id_option_id: {
                            header_id: headerId,
                            option_id: result.option_id
                        }
                    },
                    data: {
                        approved: result.approved,
                        updated_at: new Date()
                    }
                });
                return update;
            })
        );

        return results;
    }

    static async approvedByAssessor(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia05_headers: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia05_headers) {
            throw new NotFoundError('IA05 header');
        }

        const headerId = existingResult.ia05_headers.id;

        const update = await prisma.result_ia05_header.update({
            where: { id: headerId },
            data: {
                approved_assessor: true,
            },
            include: {
                result: {
                    include: {
                        assessee: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        return {
            id: update.result.id,
            result_id: update.result.id,
            assessee: {
                id: update.result.assessee.id,
                name: update.result.assessee.user.full_name,
                email: update.result.assessee.user.email
            },
            approved_assessee: update.approved_assessee,
            approved_assessor: update.approved_assessor
        };
    }

    static async approvedByAssessee(resultId: number) {
        const existingResult = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                ia05_headers: true
            }
        });
        if (!existingResult) {
            throw new NotFoundError('Result');
        }
        if (!existingResult.ia05_headers) {
            throw new NotFoundError('IA05 header');
        }

        const headerId = existingResult.ia05_headers.id;

        const update = await prisma.result_ia05_header.update({
            where: { id: headerId },
            data: {
                approved_assessee: true,
            },
            include: {
                result: {
                    include: {
                        assessee: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        return {
            id: update.result.id,
            result_id: update.result.id,
            assessee: {
                id: update.result.assessee.id,
                name: update.result.assessee.user.full_name,
                email: update.result.assessee.user.email
            },
            approved_assessee: update.approved_assessee,
            approved_assessor: update.approved_assessor
        };
    }
}