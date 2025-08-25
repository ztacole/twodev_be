import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/error';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from './user.type';
import bcrypt from 'bcryptjs';

export class UserService {
    static async createUser(data: CreateUserRequest): Promise<UserResponse> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                full_name: data.full_name,
                email: data.email,
                password: hashedPassword,
                role_id: data.role_id,
            },
            include: { role: true }
        });

        return formatUserResponse(user);
    }

    static async getUsers(): Promise<UserResponse[]> {
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        return users.map(formatUserResponse);
    }

    static async getUserById(id: number): Promise<UserResponse> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });

        if (!user) {
            throw new NotFoundError('User');
        }

        return formatUserResponse(user);
    }

    static async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User');
        }

        let hashedPassword: string | undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                full_name: data.full_name ?? user.full_name,
                email: data.email ?? user.email,
                password: hashedPassword ?? user.password,
                role_id: data.role_id ?? user.role_id,
            },
            include: { role: true }
        });

        return formatUserResponse(updatedUser);
    }

    static async deleteUser(id: number): Promise<void> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User');
        }

        await prisma.user.delete({ where: { id } });
    }
}

function formatUserResponse(user: any): UserResponse {
    return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: {
            id: user.role.id,
            name: user.role.name,
        },
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}

