export interface AK05Request {
  result_id: number;
  items: AK05ItemRequest[];
}

export interface AK05ItemRequest {
  is_competent: boolean;
  description?: string | null;
  negative_positive_aspects?: string | null;
  rejection_notes?: string | null;
  improvement_suggestions?: string | null;
  approved_assessor?: string | null;
}

export interface AK05Response {
  id: number;
  result_id: number;
  is_competent: boolean;
  description?: string | null;
  negative_positive_aspects?: string | null;
  rejection_notes?: string | null;
  improvement_suggestions?: string | null;
  approved_assessor?: string | null;
  created_at: Date;
  updated_at: Date;
}

