export interface AK03Header {
  id: number;
  result_id: number;
  comment?: string | null;
  rows: AK03[];
}

export interface AK03 {
  id: number;
  header_id: number;
  question: string;
  answer: boolean;
  comment?: string | null;
}

export interface AK03Request {
  result_id: number;
  comment?: string | null;
  items: AK03ItemRequest[];
}

export interface AK03ItemRequest {
  question: string;
  answer: boolean;
  comment?: string | null;
}

export interface AK03Response {
  id: number;
  result_id: number;
  comment?: string | null;
  rows: AK03[];
}
