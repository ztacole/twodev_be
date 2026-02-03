// Response
export interface AssessmentReportResponse {
  id: number;
  is_competent: number;
  statement: string;
}

// Request
export interface AssessmentReportRequest {
  assessment_id: number;
  is_competent: number;
  statement: string;
}