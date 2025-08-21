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
    tools: IA02ToolsRequest[];
    qa_ia03: IA03QuestionRequest[]
}

interface IA03QuestionRequest {
    question: string;
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

export interface AssessmentDetailsResponse {
    id: number;
    code: string;
    occupation: OccupationResponse;
    uc_apl02s: UCAPL02Response[];
    groups_ia: GroupIAResponse[];
    ia05_questions: IA05QuestionResponse[];
    ia07_questions: IA07QuestionResponse[];
}

interface UCAPL02Response {
    unit_code: string;
    title: string;
    elements: ElementAPL02Response[];
}

interface ElementAPL02Response {
    title: string;
    details: ElementDetailsAPL02Response[];
}

interface ElementDetailsAPL02Response {
    description: string;
}   

interface GroupIAResponse {
    name: string;
    scenario: string;
    duration: number;
    units: ucIAResponse[];
    tools: IA02ToolsResponse[]
}

interface ucIAResponse {
    unit_code: string;
    title: string;
    elements: elementIAResponse[]
}

interface elementIAResponse {
    title: string;
    details: elementDetailsIAResponse[]
}

interface elementDetailsIAResponse {
    description: string;
    benchmark: string;
}

interface IA02ToolsResponse {
    name: string;
}

interface IA05QuestionResponse {
    order: number;
    question: string;
    options: IA05OptionResponse[]
}

interface IA05OptionResponse {
    option: string;
    is_answer: boolean;
}

interface IA07QuestionResponse {
    question: string;
    answer_key: string;
}