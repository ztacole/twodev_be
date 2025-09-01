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
    answer: IA05OptionResponse;
}

// Request
export interface SendAssesseeResultRequest {
    result_id: number,
    answers: AssesseeAnswerRequest[]
}

interface AssesseeAnswerRequest {
    option_id: number
}

export interface SendAssessorResultRequest {
    result_id: number;
    is_achieved: boolean;
    unit?: string;
    element?: string;
    kuk?: string;
    results: ResultDetailRequest[];
}

interface ResultDetailRequest {
    option_id: number;
    approved: boolean
}