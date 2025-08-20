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
    details: ElementDetailsResponse[];
}

interface ElementDetailsResponse {
    id: number;
    description: string;
}

// Request

interface AssessmentRequest {
    occupation_id: number;
    code: string;
    uc_apl02: UCAPL02Request[];
}

interface UCAPL02Request {
    unit_code: string;
    title: string;
    elements: ElementAPL02Request[];
}

interface ElementAPL02Request {
    title: string;
    element_details: ElementDetailsAPL02Request[];
}

interface ElementDetailsAPL02Request {
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
    UCAPL02Request as UnitCompetencyRequest,
    ElementAPL02Request as ElementRequest,
    ElementDetailsAPL02Request as ElementDetailsRequest,
};