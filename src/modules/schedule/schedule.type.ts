// Response

export interface ScheduleResponse {
    id: number;
    assessment: AssessmentResponse;
    start_date: Date;
    end_date: Date;
}

export interface AssessmentResponse {
    id: number;
    code: string;
    occupation: OccupationResponse;
}

export interface OccupationResponse {
    id: number;
    name: string;
    scheme: SchemeResponse;
}

export interface SchemeResponse {
    id: number;
    code: string;
    name: string;
}

// Request

export interface ScheduleRequest {
    assessment_id: number;
    start_date: Date;
    end_date: Date;
    schedule_details: ScheduleDetailRequest[]
}

export interface ScheduleDetailRequest {
    assessor_id: number;
    location: string;
}