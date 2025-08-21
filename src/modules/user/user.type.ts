export interface CreateUserRequest {
    full_name?: string;
    email: string;
    password?: string;
    role_id?: number;
}

export interface UpdateUserRequest {
    full_name?: string;
    email?: string;
    password?: string;
    role_id?: number;
}
