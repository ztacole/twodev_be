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