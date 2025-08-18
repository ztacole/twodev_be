export interface AK01CreateRequest {
  result_id: number;
  approved_assessee: boolean;
  approved_assessor: boolean;
  evidences: string[];
}

export interface AK01UpdateRequest {
  approved_assessee?: boolean;
  approved_assessor?: boolean;
  evidences?: string[];
}

export interface AK01Response {
  id: number;
  result_id: number;
  approved_assessee: boolean;
  approved_assessor: boolean;
  rows: AK01Row[];
}

export interface AK01Row {
  id: number;
  header_id: number;
  evidence: string;
}

export interface AK02CreateRequest {
  result_id: number;
  approved_assessee: boolean;
  approved_assessor: boolean;
  is_competent: boolean;
  follow_up?: string;
  comment?: string;
  rows: AK02RowRequest[];
}

export interface AK02RowRequest {
  uc_id: number;
  evidence: string;
}

export interface AK02UpdateRequest {
  approved_assessee?: boolean;
  approved_assessor?: boolean;
  is_competent?: boolean;
  follow_up?: string;
  comment?: string;
  rows?: AK02RowRequest[];
}

export interface AK02Response {
  id: number;
  result_id: number;
  approved_assessee: boolean;
  approved_assessor: boolean;
  is_competent: boolean;
  follow_up?: string;
  comment?: string;
  rows: AK02Row[];
}

export interface AK02Row {
  id: number;
  header_id: number;
  uc_id: number;
  evidence: string;
  uc: {
    id: number;
    unit_code: string;
    title: string;
  };
}

export interface AKListResponse {
  ak01: AK01Response[];
  ak02: AK02Response[];
}