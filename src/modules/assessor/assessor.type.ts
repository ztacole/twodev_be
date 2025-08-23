// Response Types
export interface AssessorResponse {
    id: number;
    user_id: number;
    full_name: string;
    scheme_id: number;
    address: string;
    phone_no: string;
    birth_date: Date;
    no_reg_met: string
}

// Request Types
export interface AssessorRequest {
    user_id: number;
    full_name: string;
    scheme_id: number;
    address: string;
    phone_no: string;
    birth_date: Date | string;,
    no_reg_met: string
}