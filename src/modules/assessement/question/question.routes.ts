import { Router } from 'express';
import { QuestionController } from './question.controller';

const router = Router();
const controller = new QuestionController();

router.get('/assessment/:assessmentId', controller.getQuestionsByAssessmentId.bind(controller));
router.post('/create', controller.createQuestion.bind(controller));
router.post('/submit-answers', controller.submitAnswers.bind(controller));

export default router;
