import { db } from '../../config/drizzle';
import { NotFoundError } from '../../common/error';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from './user.type';
import bcrypt from 'bcryptjs';
import { user as userTable, role as roleTable } from '../../../drizzle/schema';
import { and, eq, sql } from 'drizzle-orm';
import { PagingMeta } from '../../helper/type';

export class UserService {
    static async createUser(data: CreateUserRequest): Promise<UserResponse> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        await db.insert(userTable).values({
            full_name: data.full_name,
            email: data.email,
            password: hashedPassword,
            role_id: data.role_id,
        });

        const user = await db.query.user.findFirst({ where: eq(userTable.email, data.email) });
        if (!user) throw new NotFoundError('User');

        const role = await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) });
        return formatUserResponse({ ...user, role });
    }

    static async getUsers(page: number = 1, limit: number = 10): Promise<{ data: UserResponse[]; meta: PagingMeta }> {
        const offset = (page - 1) * limit;

        const users = await db.select().from(userTable).limit(limit).offset(offset);
        const roles = await db.select().from(roleTable);
        const roleById = new Map(roles.map(r => [r.id, r]));

        const countRows = await db.select({ count: sql<number>`COUNT(*)` }).from(userTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: users.map(u => formatUserResponse({ ...u, role: roleById.get(u.role_id) })),
            meta: { current_page: page, limit, total, total_pages: totalPages }
        };
    }

    static async getUserById(id: number): Promise<UserResponse> {
        const user = await db.query.user.findFirst({ where: eq(userTable.id, id) });
        if (!user) throw new NotFoundError('User');
        const role = await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) });
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
                full_name: data.full_name ?? existing.full_name,
                email: data.email ?? existing.email,
                password: hashedPassword ?? existing.password,
                role_id: data.role_id ?? existing.role_id,
            })
            .where(eq(userTable.id, id));

        const updated = await db.query.user.findFirst({ where: eq(userTable.id, id) });
        if (!updated) throw new NotFoundError('User');
        const role = await db.query.role.findFirst({ where: eq(roleTable.id, updated.role_id) });
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
        full_name: user.full_name,
        email: user.email,
        role: {
            id: user.role.id,
            name: user.role.name,
        },
        created_at: user.createdAt,
        updated_at: user.updatedAt,
    };
}

