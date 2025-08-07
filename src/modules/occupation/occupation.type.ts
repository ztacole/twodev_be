export interface OccupationRequest {
    scheme_id: number;
    name: string;
}

export interface OccupationResponse {
    id: number;
    scheme_id: number;
    name: string;
    scheme?: any;
}