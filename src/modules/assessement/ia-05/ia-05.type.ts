export interface IA05QuestionResponse {
    id: number;
    order: number;
    question: string;
    options: IA05OptionResponse[];
}

interface IA05OptionResponse {
    id: number;
    option: string;
}

export interface IA05QuestionsAnswerResponse {
    id: number;
    order: number;
    question: string;
    answers: string;
}