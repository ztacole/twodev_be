export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    role_id: number;
  };
  token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
} 