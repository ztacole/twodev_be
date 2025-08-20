// Response Types
export interface AssesseeResponse {
    id: number;
    user_id: number;
    full_name: string;
    identity_number: string;
    birth_date: Date;
    birth_location: string;
    gender: string;
    nationality: string;
    phone_no: string;
    house_phone_no?: string | null;
    office_phone_no?: string | null;
    address: string;
    postal_code?: string | null;
    educational_qualifications: string;
    jobs: JobResponse[];
}

export interface JobResponse {
    id: number;
    assessee_id: number;
    institution_name: string;
    address: string;
    position: string;
    phone_no: string;
    postal_code?: string | null;
    job_email?: string | null;
}

// Request Types
export interface AssesseeRequest {
    user_id: number;
    full_name: string;
    identity_number: string;
    birth_date: Date | string;
    birth_location: string;
    gender: string;
    nationality: string;
    phone_no: string;
    house_phone_no?: string;
    office_phone_no?: string;
    address: string;
    postal_code?: string;
    educational_qualifications: string;
    jobs?: JobRequest[];
}

export interface JobRequest {
    institution_name: string;
    address: string;
    position: string;
    phone_no: string;
    postal_code?: string;
    job_email?: string;
}