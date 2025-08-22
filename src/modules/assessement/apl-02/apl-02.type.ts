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
    title: string;
    details: ElementDetailsResponse[];
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
export interface ResultHeaderRequest {
    result_id: number;
    elements: ElementResultRequest[];
}

export interface ElementResultRequest {
    element_id: number;
    evidences: EvidenceRequest[];
}

export interface EvidenceRequest {
    evidence: string;
}