// Request
export interface CreateUserRequest {
    full_name: string;
    email: string;
    password: string;
    role_id: number;
}

export interface UpdateUserRequest {
    full_name?: string;
    email?: string;
    password?: string;
    role_id?: number;
}

// Response
export interface UserResponse {
    id: number;
    full_name: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    created_at: Date;
    updated_at: Date;
}
