// Response Types
export interface DashboardAssessorResponse {
    result_id: number;
    assessee_id: number;
    full_name: string;
    assessment_code: string;
    assessment_name: string;
    apl02_completed: boolean;
    ia01_completed: boolean;
    ia03_completed: boolean;
    ia05_completed: boolean;
    ia07_completed: boolean;
    ak01_completed: boolean;
    ak02_completed: boolean;
}
