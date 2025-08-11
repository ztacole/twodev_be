import { prisma } from '../../../config/db';

export class QuestionService {
  async getQuestionsByAssessmentId(assessmentId: number) {
    const questions = await prisma.assessment_Question.findMany({
      where: { assessment_id: assessmentId },
      include: {
        pg_details: true,
      },
      orderBy: { id: 'asc' }
    });

    return questions.map(question => ({
      id: question.id,
      question: question.question,
      type: question.type,
      options: question.pg_details.map(detail => ({
        value: detail.option,
        label: detail.option,
        isCorrect: detail.isanswer
      }))
    }));
  }

  async createQuestion(data: any) {
    const { assessment_id, type, question, options } = data;

    const createdQuestion = await prisma.assessment_Question.create({
      data: {
        assessment_id,
        type,
        question,
        pg_details: options ? {
          create: options.map((option: any) => ({
            option: option.label,
            isanswer: option.isCorrect || false
          }))
        } : undefined
      },
      include: {
        pg_details: true
      }
    });

    return createdQuestion;
  }

  async submitAnswers(data: any) {
    const { assessee_id, answers } = data;

    const results = [];
    for (const answer of answers) {
      const result = await prisma.assessee_Answer.create({
        data: {
          question_id: answer.question_id,
          assessee_id,
          answer: answer.answer
        }
      });
      results.push(result);
    }

    return results;
  }

  async getAssesseeAnswers(assesseeId: number, assessmentId: number) {
    return prisma.assessee_Answer.findMany({
      where: {
        assessee_id: assesseeId,
        question: {
          assessment_id: assessmentId
        }
      },
      include: {
        question: {
          include: {
            pg_details: true
          }
        }
      }
    });
  }
}
