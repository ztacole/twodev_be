import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssessorResponse, AssessorRequest } from './assessor.type';
import { assessor as assessorTable, user as userTable, role as roleTable, scheme as schemeTable } from '../../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class AssessorService {
    static async getAssessors(): Promise<AssessorResponse[]> {
        const assessors = await db.select().from(assessorTable);
        const userIds = assessors.map(a => a.user_id);
        const schemeIds = assessors.map(a => a.scheme_id);
        const users = userIds.length ? await db.select().from(userTable) : [];
        const roles = await db.select().from(roleTable);
        const schemes = schemeIds.length ? await db.select().from(schemeTable) : [];
        const roleById = new Map(roles.map(r => [r.id, r]));
        const userById = new Map(users.map(u => [u.id, u]));
        const schemeById = new Map(schemes.map(s => [s.id, s]));
        return assessors.map(a => this.formatAssessorResponse({
            ...a,
            user: { ...userById.get(a.user_id), role: roleById.get(userById.get(a.user_id)?.role_id as number) },
            scheme: schemeById.get(a.scheme_id),
        } as any));
    }

    static async getAssessorById(id: number): Promise<AssessorResponse> {
        const a = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!a) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, a.user_id) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, a.scheme_id) });
        return this.formatAssessorResponse({ ...a, user: { ...user, role }, scheme } as any);
    }

    static async getAssessorByUserId(user_id: number): Promise<AssessorResponse> {
        const a = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, user_id) });
        if (!a) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, a.user_id) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, a.scheme_id) });
        return this.formatAssessorResponse({ ...a, user: { ...user, role }, scheme } as any);
    }

    static async createAssessor(data: AssessorRequest): Promise<AssessorResponse> {
        const existing = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, data.user_id) });
        if (existing) {
            throw new DuplicateEntryError('Assessor untuk user_id', data.user_id.toString());
        }

        await db.insert(assessorTable).values({
            user_id: data.user_id,
            scheme_id: data.scheme_id,
            no_reg_met: data.no_reg_met,
            address: data.address,
            phone_no: data.phone_no,
            birth_date: new Date(data.birth_date) as any,
        });
        const created = await db.query.assessor.findFirst({ where: and(eq(assessorTable.user_id, data.user_id), eq(assessorTable.scheme_id, data.scheme_id)) });
        if (!created) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, created.user_id) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, created.scheme_id) });
        return this.formatAssessorResponse({ ...created, user: { ...user, role }, scheme } as any);
    }

    static async updateAssessor(id: number, data: AssessorRequest): Promise<AssessorResponse> {
        const existing = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Assessor');
        }

        await db.update(assessorTable)
            .set({
                user_id: data.user_id,
                scheme_id: data.scheme_id,
                no_reg_met: data.no_reg_met,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date) as any,
            })
            .where(eq(assessorTable.id, id));

        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!assessor) throw new NotFoundError('Assessor');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) });
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, assessor.scheme_id) });
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
            user_id: assessor.user_id,
            scheme_id: assessor.scheme_id,
            name: assessor.user.fullName,
            address: assessor.address,
            phone_no: assessor.phone_no,
            birth_date: assessor.birth_date,
            no_reg_met: assessor.no_reg_met
        };
    }
}