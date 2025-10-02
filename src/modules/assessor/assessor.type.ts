// Response Types
export interface AssessorResponse {
    id: number;
    user_id: number;
    scheme_id: number;
    full_name: string;
    email: string;
    birth_location: string;
    birth_date: Date;
    no_reg_met: string;
    institution: string;
    address: string;
    phone_no: string;
    created_at?: Date;
    updated_at?: Date;
    scheme_code?: string;
    scheme_name?: string;
    tax_id_number?: string;
    bank_book_cover?: string;
    certificate?: string;
    id_card?: string;
    national_id?: string;
}

interface SchemeResponse {
    id: number;
    code: string;
    name: string;
}

interface AssessorDetailResponse {
    id: number;
    assessor_id: number;
    tax_id_number: string;
    bank_book_cover: string;
    certificate: string;
    id_card: string;
    national_id: string;
}

// Request Types
export interface AssessorRequest {
    user_id: number;
    name?: string;
    email?: string;
    birth_location: string;
    birth_date: Date | string;
    no_reg_met: string;
    institution: string;
    scheme_id: number;
    address: string;
    phone_no: string;
}