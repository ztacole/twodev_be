export interface AssesseeJobInput {
    institution_name: string;
    address: string;
    position: string;
    phone_no: string;
}

export interface AssesseeInput {
    user_id: number;
    identity_number: string;
    birth_date: string;
    birth_location: string;
    gender: 'MALE' | 'FEMALE';
    nationality: string;
    phone_no: string;
    address: string;
    educational_qualifications: string;
    jobs?: AssesseeJobInput[];
}

export interface AssesseeJob {
    id: number;
    assessee_id: number;
    institution_name: string;
    address: string;
    position: string;
    phone_no: string;
}

export interface Assessee {
    id: number;
    user_id: number;
    identity_number: string;
    birth_date: string;
    birth_location: string;
    gender: 'MALE' | 'FEMALE';
    nationality: string;
    phone_no: string;
    address: string;
    educational_qualifications: string;
    jobs: AssesseeJob[];
} 