export interface UnitCompetencyRequest {
    assessment_id: number;
    unit_code: string;
    title: string;
}

export interface UnitCompetencyResponse {
    id: number;
    assessment_id: number;
    unit_code: string;
    title: string;
    assessment?: any;
    elements?: any[];
}