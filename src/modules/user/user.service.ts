import { db } from '../../config/drizzle';
import { DuplicateEntryError, NotFoundError } from '../../common/error';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from './user.type';
import bcrypt from 'bcryptjs';
import { user as userTable, role as roleTable, scheme as schemeTable, assessment as assessmentTable } from '../../../drizzle/schema';
import { and, asc, eq, like, or, sql } from 'drizzle-orm';
import { PagingMeta } from '../../helper/type';
import { DashboardSummary } from '../dashboard/admin/dashboard.type';

export class UserService {
    static async createUser(data: CreateUserRequest): Promise<UserResponse> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const existing = await db.query.user.findFirst({ where: eq(userTable.email, data.email) });
        if (existing) {
            throw new DuplicateEntryError('Email', data.email);
        }

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

    static async getUsers(page: number = 1, limit: number = 10, keyword?: string, role_name?: string): Promise<{
        data: UserResponse[]; 
        meta: PagingMeta;
        summary: DashboardSummary;
    }> {
        const offset = (page - 1) * limit;

        const users = await db.select({
            id: userTable.id,
            full_name: userTable.full_name,
            email: userTable.email,
            role_id: userTable.role_id,
            created_at: userTable.created_at,
            updated_at: userTable.updated_at,
            role: roleTable,
        })
            .from(userTable)
            .leftJoin(roleTable, eq(userTable.role_id, roleTable.id))
            .where(and(
                or(
                    keyword ? like(userTable.full_name, `%${keyword}%`) : undefined,
                    keyword ? like(userTable.email, `%${keyword}%`) : undefined,
                ),
                role_name ? eq(roleTable.name, role_name) : undefined
            ))
            .orderBy(asc(roleTable.name), asc(userTable.full_name), asc(userTable.created_at))
            .limit(limit)
            .offset(offset);

        const countRows = await db.select({ count: sql<number>`COUNT(*)` }).from(userTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const [schemes, assessments, userAssessor, userAssessee] =
        await Promise.all([
            db.select().from(schemeTable),
            db.select().from(assessmentTable),
            db.select().from(userTable).where(eq(userTable.role_id, 2)),
            db.select().from(userTable).where(eq(userTable.role_id, 3)),
        ]);

        return {
            data: users.map((u) => formatUserResponse(u)),
            summary: {
                totalSchemes: schemes.length,
                totalAssessments: assessments.length,
                totalAssessors: userAssessor.length,
                totalAssessees: userAssessee.length,
            },
            meta: {
                current_page: page,
                limit,
                total,
                total_pages: totalPages,
            },
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
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}

