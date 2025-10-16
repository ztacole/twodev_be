import { AssessmentDetailsResponse, AssessmentResponse } from "../assessment.type";

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
    job: AssesseeJobResponse;
    assessment: AssessmentDetailsResponse;
}

interface CertificateDocsResponse {
    id: number;
    admin_id: number;
    result_id: number;
    purpose: string;
    school_report_card?: string;
    field_work_practice_certificate?: string;
    student_card?: string;
    family_card?: string;
    id_card?: string;
}

interface ResultDocResponse {
    id: number;
    admin_id: number;
    result_id: number;
    purpose: string;
    school_report_card?: string;
    field_work_practice_certificate?: string;
    student_card?: string;
    family_card?: string;
    id_card?: string;
    approved: boolean;
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
    assessment_id: number;
    assessee_id: number;
    assessor_id: number;
    purpose?: string;
    school_report_card?: string;
    field_work_practice_certificate?: string;
    student_card?: string;
    family_card?: string;
    id_card?: string;
}

interface ResultDocResponse {
    id: number;
    result_id: number;
    purpose: string;
    school_report_card?: string;
    field_work_practice_certificate?: string;
    student_card?: string;
    family_card?: string;
    id_card?: string;
    approved: boolean;
}

export {
    AssesseeResponse,
    AssesseeJobResponse,
    CertificateDocsResponse,
    AssesseeRequest,
    AssesseeJobRequest,
    CertificateDocsRequest,
    ResultDocResponse
};