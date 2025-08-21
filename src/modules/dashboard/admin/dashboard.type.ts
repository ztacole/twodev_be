export interface DashboardSummary {
  totalSchemes: number;
  totalAssessments: number;
  totalAssessors: number;
  totalAssessees: number;
}

export interface DashboardSchedule {
  id: number;
  assessment_id: number;
  start_date: Date;
  end_date: Date;
}

export interface DashboardVerification {
  id: number;
  result_id: number;
  purpose: string;
  school_report_card: string | null;
  field_work_practice_certificate: string | null;
  student_card: string | null;
  family_card: string | null;
  id_card: string | null;
  approved: boolean;
}
