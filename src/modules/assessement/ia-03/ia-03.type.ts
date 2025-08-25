// Response
export interface GroupIA03Response {
    id: number;
    assessment_id: number;
    name: string;
    units: ucIAResponse[];
    questions: IA03QuestionResponse[];
}

interface ucIAResponse {
    id: number;
    unit_code: string;
    title: string;
}

interface IA03QuestionResponse {
    id: number;
    question: string;
}

// Request
export interface SendResultRequest {
    result_id: number;
    questions: QuestionAnswersRequest[];
}

export interface QuestionAnswersRequest {
    question_id: number;
    answer: string;
    approved: boolean;
}