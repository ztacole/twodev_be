export interface AssessmentRequest {
    scheme_id: number;
    occupation_name: string;
    code: string;
    uc_apl02s: UCAPL02Request[];
    groups_ia01: GroupIA01Request[];
    groups_ia02?: GroupIA02Request[];
    groups_ia03: GroupIA03Request[];
    ia05_questions?: IA05QuestionRequest[];
    ia07_questions?: IA07QuestionRequest[];
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

interface GroupIA01Request {
    name: string;
    units: ucIA01Request[];
}

interface GroupIA02Request {
    name: string;
    scenario: string;
    duration: number;
    units: ucIARequest[];
    tools: IA02ToolsRequest[];
}

interface GroupIA03Request {
    name: string;
    units: ucIARequest[];
    qa_ia03: IA03QuestionRequest[]
}

interface IA03QuestionRequest {
    question: string;
}

interface ucIA01Request {
    unit_code: string;
    title: string;
    elements: elementIARequest[]
}

interface ucIARequest {
    unit_code: string;
    title: string;
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
    groups_ia01: GroupIA01Response[];
    groups_ia02: GroupIA02Response[];
    groups_ia03: GroupIA03Response[];
    ia05_questions: IA05QuestionResponse[];
    ia07_questions: IA07QuestionResponse[];
}

interface UCAPL02Response {
    id: number;
    unit_code: string;
    title: string;
    elements: ElementAPL02Response[];
}

interface ElementAPL02Response {
    id: number;
    title: string;
    details: ElementDetailsAPL02Response[];
}

interface ElementDetailsAPL02Response {
    id: number;
    description: string;
}   

interface GroupIA01Response {
    id: number;
    name: string;
    units: ucIA01Response[];
}

interface GroupIA02Response {
    id: number;
    name: string;
    scenario: string;
    duration: number;
    units: ucIAResponse[];
    tools: IA02ToolsResponse[];
}

interface GroupIA03Response {
    id: number;
    name: string;
    units: ucIAResponse[];
    qa_ia03: IA03QuestionResponse[];
}

interface IA03QuestionResponse {
    id: number;
    question: string;
}

interface ucIA01Response {
    id: number;
    unit_code: string;
    title: string;
    elements: elementIAResponse[]
}

interface ucIAResponse {
    id: number;
    unit_code: string;
    title: string;
}

interface elementIAResponse {
    id: number;
    title: string;
    details: elementDetailsIAResponse[]
}

interface elementDetailsIAResponse {
    id: number;
    description: string;
    benchmark: string;
}

interface IA02ToolsResponse {
    id: number;
    name: string;
}

interface IA05QuestionResponse {
    id: number;
    order: number;
    question: string;
    options: IA05OptionResponse[]
}

interface IA05OptionResponse {
    id: number;
    option: string;
    is_answer: boolean;
}

interface IA07QuestionResponse {
    id: number;
    question: string;
    answer_key: string;
}

export interface AssessorTab {
    name: string;
    status: "Belum Tuntas" | "Menunggu Asesi" | "Butuh Persetujuan" | "Tuntas";
}

export interface AssesseeTab {
    name: string;
    status: "Belum Tuntas" | "Menunggu" | "Butuh Persetujuan" | "Tuntas";
}

export interface AdminTab {
    name: string;
    status: "Belum Tuntas" | "Tuntas";
}