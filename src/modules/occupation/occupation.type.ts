export interface OccupationRequest {
    scheme_id: number;
    name: string;
}

export interface OccupationResponse {
    id: number;
    scheme: SchemeResponse;
    name: string;
}

export interface SchemeResponse {
    id: number;
    code: string;
    name: string;
}