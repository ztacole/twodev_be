// Response Types
export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

export interface AssesseeResponse {
    id: number;
    user_id: number;
    identity_number: string;
    birth_date: Date;
    birth_location: string;
    gender: Gender;
    nationality: string;
    phone_no: string;
    house_phone_no?: string;
    office_phone_no?: string;
    address: string;
    postal_code?: string;
    educational_qualifications: string;
}

// Request Types
export interface AssesseeRequest {
    user_id: number;
    identity_number: string;
    birth_date: Date | string;
    birth_location: string;
    gender: Gender;
    nationality: string;
    phone_no: string;
    house_phone_no?: string;
    office_phone_no?: string;
    address: string;
    postal_code?: string;
    educational_qualifications: string;
}