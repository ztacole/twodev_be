export interface AssesseeResponse {
    id: number;
    full_name: string;
    identity_number: string;
    birth_date: Date;
    birth_location: string;
    gender: string;
    nationality: string;
    phone_no: string;
    house_phone_no?: string;
    office_phone_no?: string;
    address: string;
    postal_code?: string;
    educational_qualifications: string;
    jobs: AssesseeJobResponse[]
}

interface AssesseeJobResponse {
    id: number;
    institution_name: string;
    address: string;
    postal_code: string;
    position: string;
    phone_no: string;
    job_email: string;
}

export interface AssessorResponse {
    id: number;
    full_name: string;
    scheme: SchemeResponse;
    address: string;
    phone_no: string;
    birth_date: Date;
}

interface SchemeResponse {
    id: number;
    code: string;
    name: string;
}