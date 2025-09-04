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
  notes?: string | null;
  approved_assessor: boolean;
}

export interface AK05Response {
  id: number;
  result: {
    id: number;
    assessment: string;
    assessee: {
      id: number;
      name: string;
      email: string;
    };
    assessor: {
      id: number;
      name: string;
      email: string;
      no_reg_met: string;
    };
    tuk: string;
    created_at: string;
    result_ak05: any[];
  };
  is_competent: boolean;
}

