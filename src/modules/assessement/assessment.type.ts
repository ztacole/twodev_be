export interface AssessmentRequest {
    occupation_id: number;
    code: string;
    uc_apl02s: UCAPL02Request[];
    groups_ia: GroupIARequest[];
    ia05_questions: IA05QuestionRequest[];
    ia07_questions: IA07QuestionRequest[];
}

interface UCAPL02Request {
    unit_code: string;
    title: string;
    elements: ElementAPL02Request[];
}

interface ElementAPL02Request {
    title: string;
    details: ElementDetailsAPL02Request[];
}

interface ElementDetailsAPL02Request {
    description: string;
}

interface GroupIARequest {
    name: string;
    scenario: string;
    duration: number;
    units: ucIARequest[];
    tools: IA02ToolsRequest[]
}

interface ucIARequest {
    unit_code: string;
    title: string;
    elements: elementIARequest[]
}

interface elementIARequest {
    title: string;
    details: elementDetailsIARequest[]
}

interface elementDetailsIARequest {
    description: string;
    benchmark: string;
}

interface IA02ToolsRequest {
    name: string;
}

interface IA05QuestionRequest {
    order: number;
    question: string;
    options: IA05OptionRequest[]
}

interface IA05OptionRequest {
    option: string;
    is_answer: boolean;
}

interface IA07QuestionRequest {
    question: string;
    answer_key: string;
}

// Response

export interface AssessmentResponse {
    id: number;
    code: string;
    occupation: OccupationResponse
}

interface OccupationResponse {
    id: number;
    name: string;
    scheme: SchemeResponse
}

interface SchemeResponse {
    id: number;
    code: string;
    name: string;
}