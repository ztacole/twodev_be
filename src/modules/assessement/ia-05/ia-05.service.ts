import { prisma } from "../../../config/db";
import { NotFoundError } from "../../../common/error";
import { IA05QuestionResponse, IA05QuestionsAnswerResponse } from "./ia-05.type";

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

    static async getAnswers(assessmentId: number): Promise<IA05QuestionsAnswerResponse[]> {
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
            answers: answer.option
        }));
    }

    static async getAssesseeAnswers(assesseeId: number): Promise<IA05QuestionsAnswerResponse[]> {
        const existingAssessee = await prisma.assessee.findUnique({
            where: { id: assesseeId }
        });

        if (!existingAssessee) {
            throw new NotFoundError('Assessee');
        }

        const answers = await prisma.result_ia05.findMany({
            where: {
                header: {
                    result: {
                        assessee_id: assesseeId
                    }
                },
            },
            orderBy: {
                option: {
                    question: {
                        order: 'asc'
                    }
                }
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
            id: answer.id,
            question_id: answer.option.question_id,
            order: answer.option.question.order,
            question: answer.option.question.question,
            answers: answer.option.option
        }));
    }
}