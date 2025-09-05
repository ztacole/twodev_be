import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssessorResponse, AssessorRequest } from './assessor.type';
import { assessor as assessorTable, user as userTable, role as roleTable, scheme as schemeTable } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class AssessorService {
    static async getAssessors(): Promise<AssessorResponse[]> {
        const assessors = await db.select().from(assessorTable);
        const userIds = assessors.map(a => a.userId);
        const schemeIds = assessors.map(a => a.schemeId);
        const users = userIds.length ? await db.select().from(userTable) : [];
        const roles = await db.select().from(roleTable);
        const schemes = schemeIds.length ? await db.select().from(schemeTable) : [];
        const roleById = new Map(roles.map(r => [r.id, r]));
        const userById = new Map(users.map(u => [u.id, u]));
        const schemeById = new Map(schemes.map(s => [s.id, s]));
        return assessors.map(a => this.formatAssessorResponse({
            ...a,
            user: { ...userById.get(a.userId), role: roleById.get(userById.get(a.userId)?.roleId as number) },
            scheme: schemeById.get(a.schemeId),
        } as any));
    }

    static async getAssessorById(id: number): Promise<AssessorResponse> {
        const a = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!a) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, a.userId) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.roleId) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, a.schemeId) });
        return this.formatAssessorResponse({ ...a, user: { ...user, role }, scheme } as any);
    }

    static async getAssessorByUserId(userId: number): Promise<AssessorResponse> {
        const a = await db.query.assessor.findFirst({ where: eq(assessorTable.userId, userId) });
        if (!a) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, a.userId) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.roleId) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, a.schemeId) });
        return this.formatAssessorResponse({ ...a, user: { ...user, role }, scheme } as any);
    }

    static async createAssessor(data: AssessorRequest): Promise<AssessorResponse> {
        const existing = await db.query.assessor.findFirst({ where: eq(assessorTable.userId, data.user_id) });
        if (existing) {
            throw new DuplicateEntryError('Assessor untuk user_id', data.user_id.toString());
        }

        await db.insert(assessorTable).values({
            userId: data.user_id,
            schemeId: data.scheme_id,
            noRegMet: data.no_reg_met,
            address: data.address,
            phoneNo: data.phone_no,
            birthDate: new Date(data.birth_date) as any,
        });
        const created = await db.query.assessor.findFirst({ where: and(eq(assessorTable.userId, data.user_id), eq(assessorTable.schemeId, data.scheme_id)) });
        if (!created) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, created.userId) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.roleId) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, created.schemeId) });
        return this.formatAssessorResponse({ ...created, user: { ...user, role }, scheme } as any);
    }

    static async updateAssessor(id: number, data: AssessorRequest): Promise<AssessorResponse> {
        const existing = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Assessor');
        }

        await db.update(assessorTable)
            .set({
                userId: data.user_id,
                schemeId: data.scheme_id,
                noRegMet: data.no_reg_met,
                address: data.address,
                phoneNo: data.phone_no,
                birthDate: new Date(data.birth_date) as any,
            })
            .where(eq(assessorTable.id, id));

        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!assessor) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.roleId) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, assessor.schemeId) });
        return this.formatAssessorResponse({ ...assessor, user: { ...user, role }, scheme } as any);
    }

    static async deleteAssessor(id: number): Promise<void> {
        const existing = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Assessor');
        }

        await db.delete(assessorTable).where(eq(assessorTable.id, id));
    }

    private static formatAssessorResponse(assessor: any): AssessorResponse {
        return {
            id: assessor.id,
            user_id: assessor.userId,
            scheme_id: assessor.schemeId,
            name: assessor.user.fullName,
            address: assessor.address,
            phone_no: assessor.phoneNo,
            birth_date: assessor.birthDate,
            no_reg_met: assessor.noRegMet
        };
    }
}