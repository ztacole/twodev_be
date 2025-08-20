// Response
interface AssesseeJobResponse {
    id: number;
    assessee_id: number;
    institution_name: string;
    address: string;
    postal_code: string;
    position: string;
    phone_no: string;
    job_email: string;
}

interface AssesseeResponse {
    id: number;
    user_id: number;
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
    postal_code: string;
    educational_qualifications: string;
    jobs: AssesseeJobResponse[];
}

interface CertificateDocsResponse {
    id: number;
    result_id: number;
    assessor_id: number;
    purpose: string;
    school_report_card?: string;
    field_work_practice_certificate?: string;
    student_card?: string;
    family_card?: string;
    id_card?: string;
}

// Request
interface AssesseeJobRequest {
    institution_name: string;
    address: string;
    postal_code: string;
    position: string;
    phone_no: string;
    job_email: string;
}

interface AssesseeRequest {
    id?: number;
    user_id: number;
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
    postal_code: string;
    educational_qualifications: string;
    jobs?: AssesseeJobRequest[];
}

interface CertificateDocsRequest {
    assessee_id: number;
    assessor_id: number;
    purpose?: string;
    school_report_card?: string;
    field_work_practice_certificate?: string;
    student_card?: string;
    family_card?: string;
    id_card?: string;
}

export {
    AssesseeResponse,
    AssesseeJobResponse,
    CertificateDocsResponse,
    AssesseeRequest,
    AssesseeJobRequest,
    CertificateDocsRequest
};