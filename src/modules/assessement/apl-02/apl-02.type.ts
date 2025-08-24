// Response
interface AssessmentResponse {
    id: number;
    occupation: OccupationResponse;
    code: string;
    unit_competencies: UnitCompetencyResponse[];
}

interface OccupationResponse {
    id: number;
    scheme: SchemeResponse;
    name: string;
}

interface SchemeResponse {
    id: number;
    code: string;
    name: string;
}

interface UnitCompetencyResponse {
    id: number;
    unit_code: string;
    title: string;
    elements: ElementResponse[];
}

export interface ElementResponse {
    id: number;
    uc_id: number;
    title: string;
    details: ElementDetailsResponse[];
    result?: {
        id?: number;
        is_competent: boolean;
        created_at?: Date;
        updated_at?: Date;
        evidences?: any[];
    };
}

interface ElementDetailsResponse {
    id: number;
    description: string;
}

export interface ElementsResultResponse {
    id: number;
    title: string;
    details: ElementDetailsResponse[];
}

// Request
export interface ResultRequest {
    result_id: number;
    is_competent: boolean;
}

export interface HeaderRequest {
    result_id: number;
    elements: ElementResultRequest[];
}

interface ElementResultRequest {
    element_id: number;
    is_competent: boolean;
    evidences: EvidenceRequest[];
}

interface EvidenceRequest {
    evidence: string;
}

export interface GenerateAsssessorRequest {
    reccomendation: boolean;
}