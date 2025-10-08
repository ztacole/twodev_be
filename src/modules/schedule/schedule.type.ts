// Response

export interface ScheduleResponse {
    id: number;
    assessment: AssessmentResponse;
    start_date: string;
    end_date: string;
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

export interface ActiveScheduleResponse {
    status: string;
    detail: DetailResponse;
}

export interface DetailResponse {
    id: number;
    assessment: AssessmentResponse;
    start_date: string;
    end_date: string;
    schedule_details: ScheduleDetailResponse;
}

// Request

export interface ScheduleRequest {
    assessment_id: number;
    start_date: string;
    end_date: string;
    schedule_details: ScheduleDetailRequest[]
}

export interface ScheduleDetailRequest {
    id?: number;
    assessor_id: number;
    location: string;
}

export interface updateScheduleRequest {
    start_date: string;
    end_date: string;
    schedule_details?: ScheduleDetailRequest[];
}

export interface LetterAssignmentRequest {
    type: "assignments" | "verifications" | "assessor";
    number: string;
    LSP_name?: string; // default
    assigner_name?: string;
    schedule_detail_id: number;
    work_unit?: string; // default
    activity_name?: string;
    position: string;
    location?: string; // default
    address?: string; // default
    issued_in?: string; // default
}
