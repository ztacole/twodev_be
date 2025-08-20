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