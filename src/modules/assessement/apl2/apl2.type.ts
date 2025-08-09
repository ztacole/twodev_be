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

interface ElementResponse {
    id: number;
    title: string;
    element_details: ElementDetailsResponse[];
}

interface ElementDetailsResponse {
    id: number;
    description: string;
}

// Request

interface AssessmentRequest {
    occupation_id: number;
    code: string;
    unit_competencies: UnitCompetencyRequest[];
}

interface UnitCompetencyRequest {
    unit_code: string;
    title: string;
    elements: ElementRequest[];
}

interface ElementRequest {
    title: string;
    element_details: ElementDetailsRequest[];
}

interface ElementDetailsRequest {
    description: string;
}

export {
    AssessmentResponse,
    OccupationResponse,
    SchemeResponse,
    UnitCompetencyResponse,
    ElementResponse,
    ElementDetailsResponse,
    AssessmentRequest,
    UnitCompetencyRequest,
    ElementRequest,
    ElementDetailsRequest,
};