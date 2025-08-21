// Response

export interface ScheduleResponse {
    id: number;
    assessment: AssessmentResponse;
    start_date: Date;
    end_date: Date;
    schedule_details: ScheduleDetailResponse[];
}

interface ScheduleDetailResponse {
    id: number;
    assessor: AssessorResponse;
    location: string;
}

interface AssessorResponse {
    id: number;
    full_name: string;
    phone_no: string;
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