import { Request, Response } from 'express';
import { QuestionService } from './question.service';

export class QuestionController {
  private questionService: QuestionService;

  constructor() {
    this.questionService = new QuestionService();
  }

  async getQuestionsByAssessmentId(req: Request, res: Response) {
    try {
      const assessmentId = Number(req.params.assessmentId);
      const questions = await this.questionService.getQuestionsByAssessmentId(assessmentId);

      if (!questions || questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada soal yang ditemukan untuk assessment ini',
        });
      }

      res.json({
        success: true,
        message: 'Soal berhasil diambil',
        data: questions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createQuestion(req: Request, res: Response) {
    try {
      const question = await this.questionService.createQuestion(req.body);

      res.status(201).json({
        success: true,
        message: 'Soal berhasil dibuat',
        data: question,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async submitAnswers(req: Request, res: Response) {
    try {
      const result = await this.questionService.submitAnswers(req.body);

      res.json({
        success: true,
        message: 'Jawaban berhasil disimpan',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
