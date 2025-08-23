export interface AK03 {
  id: number;
  result_id: number;
  component: string;
  is_ok: boolean;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AK03Request {
  result_id: number;
  items: AK03ItemRequest[];
}

export interface AK03ItemRequest {
  component: string;
  is_ok: boolean;
  comment?: string;
}

export interface AK03Response {
  id: number;
  result_id: number;
  component: string;
  is_ok: boolean;
  comment?: string | null;
  created_at: Date;
  updated_at: Date;
}
