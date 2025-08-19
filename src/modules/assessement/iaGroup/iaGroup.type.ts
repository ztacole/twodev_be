export interface GroupIARequest {
    assessment_id: number;
    name: string;
    scenario: string;
    duration: number;
    units: ucIARequest[];
    tools: IA02ToolsRequest[]
}

export interface ucIARequest {
    unit_code: string;
    title: string;
    elements: elementIARequest[]
}

export interface elementIARequest {
    title: string;
    details: elementDetailsIARequest[]
}

export interface elementDetailsIARequest {
    description: string;
    benchmark: string;
}

export interface IA02ToolsRequest {
    name: string;
}

// Response
export interface GroupIA01Response {
    id: number;
    assessment_id: number;
    name: string;
    units: ucIAResponse[];
}

interface ucIAResponse {
    id: number;
    unit_code: string;
    title: string;
}

export interface elementIAResponse {
    id: number;
    title: string;
    details: elementDetailsIAResponse[]
}

interface elementDetailsIAResponse {
    id: number;
    description: string;
    benchmark: string;
}