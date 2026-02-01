// Update types with id for all entities
export interface UpdateAssessmentRequest {
    scheme_id: number;
    occupation_id: number;
    code: string;
    uc_apl02s: UpdateUCAPL02Request[];
    groups_ia01: UpdateGroupIA01Request[];
    groups_ia02?: UpdateGroupIA02Request[];
    groups_ia03: UpdateGroupIA03Request[];
    ia05_questions?: UpdateIA05QuestionRequest[];
    ia07_questions?: UpdateIA07QuestionRequest[];
}

export interface UpdateUCAPL02Request {
    id?: number;
    unit_code: string;
    title: string;
    elements: UpdateElementAPL02Request[];
}
export interface UpdateElementAPL02Request {
    id?: number;
    title: string;
    details: UpdateElementDetailsAPL02Request[];
}
export interface UpdateElementDetailsAPL02Request {
    id?: number;
    description: string;
}

export interface UpdateGroupIA01Request {
    id?: number;
    name: string;
    units: UpdateUcIA01Request[];
}
export interface UpdateUcIA01Request {
    id?: number;
    unit_code: string;
    title: string;
    elements: UpdateElementIARequest[];
}
export interface UpdateElementIARequest {
    id?: number;
    title: string;
    details: UpdateElementDetailsIARequest[];
}
export interface UpdateElementDetailsIARequest {
    id?: number;
    description: string;
    benchmark: string;
}

export interface UpdateGroupIA02Request {
    id?: number;
    name: string;
    scenario: string;
    duration: number;
    units: UpdateUcIARequest[];
    tools: UpdateIA02ToolsRequest[];
}
export interface UpdateUcIARequest {
    id?: number;
    unit_code: string;
    title: string;
}
export interface UpdateIA02ToolsRequest {
    id?: number;
    name: string;
}

export interface UpdateGroupIA03Request {
    id?: number;
    name: string;
    units: UpdateUcIARequest[];
    qa_ia03: UpdateIA03QuestionRequest[];
}
export interface UpdateIA03QuestionRequest {
    id?: number;
    question: string;
}

export interface UpdateIA05QuestionRequest {
    id?: number;
    order: number;
    question: string;
    options: UpdateIA05OptionRequest[];
}
export interface UpdateIA05OptionRequest {
    id?: number;
    option: string;
    is_answer: boolean;
}

export interface UpdateIA07QuestionRequest {
    id?: number;
    question: string;
    answer_key: string;
}

export interface AssessmentRequest {
    scheme_id: number;
    occupation_id: number;
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
    ia02_pdf: IA02PdfResponse;
    groups_ia03: GroupIA03Response[];
    ia05_questions: IA05QuestionResponse[];
    ia07_questions: IA07QuestionResponse[];
}

interface IA02PdfResponse {
    id: number;
    file_name: string;
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

export interface AssessmentResultGrouped {
  id: number;
  schedule_id: number;
  schedule_start_date: Date;
  schedule_end_date: Date;
  code: string;
  occupation_id: number;
  created_at: Date;
  updated_at: Date;
  occupation: {
    id: number;
    name: string;
    scheme_id: number;
    scheme: {
      id: number;
      code: string;
      name: string;
    };
  };
  assessors: {
    id: number;
    full_name: string;
    signature: string | null;
    no_reg_met: string;
    assessees: {
      result_id: number;
      score: number | null;
      is_competent: boolean;
      tuk: 'sewaktu' | 'tempat_kerja' | 'mandiri';
      created_at: Date;
      updated_at: Date;
      assessee_id: number;
      assessee_name: string;
    }[];
  }[];
}