import { db } from '../../config/drizzle';
import { NotFoundError } from '../../common/error';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from './user.type';
import bcrypt from 'bcryptjs';
import { user as userTable, role as roleTable } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class UserService {
    static async createUser(data: CreateUserRequest): Promise<UserResponse> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        await db.insert(userTable).values({
            fullName: data.full_name,
            email: data.email,
            password: hashedPassword,
            roleId: data.role_id,
        });

        const user = await db.query.user.findFirst({ where: eq(userTable.email, data.email) });
        if (!user) throw new NotFoundError('User');

        const role = await db.query.role.findFirst({ where: eq(roleTable.id, user.roleId) });
        return formatUserResponse({ ...user, role });
    }

    static async getUsers(): Promise<UserResponse[]> {
        const users = await db.select().from(userTable);
        const roles = await db.select().from(roleTable);
        const roleById = new Map(roles.map(r => [r.id, r]));
        return users.map(u => formatUserResponse({ ...u, role: roleById.get(u.roleId) }));
    }

    static async getUserById(id: number): Promise<UserResponse> {
        const user = await db.query.user.findFirst({ where: eq(userTable.id, id) });
        if (!user) throw new NotFoundError('User');
        const role = await db.query.role.findFirst({ where: eq(roleTable.id, user.roleId) });
        return formatUserResponse({ ...user, role });
    }

    static async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
        const existing = await db.query.user.findFirst({ where: eq(userTable.id, id) });
        if (!existing) throw new NotFoundError('User');

        let hashedPassword: string | undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        await db.update(userTable)
            .set({
                fullName: data.full_name ?? existing.fullName,
                email: data.email ?? existing.email,
                password: hashedPassword ?? existing.password,
                roleId: data.role_id ?? existing.roleId,
            })
            .where(eq(userTable.id, id));

        const updated = await db.query.user.findFirst({ where: eq(userTable.id, id) });
        if (!updated) throw new NotFoundError('User');
        const role = await db.query.role.findFirst({ where: eq(roleTable.id, updated.roleId) });
        return formatUserResponse({ ...updated, role });
    }

    static async deleteUser(id: number): Promise<void> {
        const existing = await db.query.user.findFirst({ where: eq(userTable.id, id) });
        if (!existing) throw new NotFoundError('User');
        await db.delete(userTable).where(eq(userTable.id, id));
    }
}

function formatUserResponse(user: any): UserResponse {
    return {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        role: {
            id: user.role.id,
            name: user.role.name,
        },
        created_at: user.createdAt,
        updated_at: user.updatedAt,
    };
}

