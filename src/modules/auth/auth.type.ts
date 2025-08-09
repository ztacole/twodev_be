export interface RegisterRequest {
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
    email: string;
    role_id: number;
  };
  token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
} 