export interface AK04Request {
  id?: number; // optional header id to update
  result_id: number;
  approved_assessee: boolean;
  q1_yes: boolean;
  q2_yes: boolean;
  q3_yes: boolean;
  reason?: string | null;
}

export interface AK04Response {
  id: number;
  result_id: number;
  approved_assessee: boolean;
  q1_yes: boolean;
  q2_yes: boolean;
  q3_yes: boolean;
  reason?: string | null;
  created_at: string;
  updated_at: string;
}
