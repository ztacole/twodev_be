import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError } from '../../common/error';
import { AssessorResponse, AssessorRequest } from './assessor.type';
import { assessor as assessorTable, user as userTable, role as roleTable, scheme as schemeTable, assessorDetail as assessorDetailTable } from '../../../drizzle/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { PagingMeta } from '../../helper/type';
import { count } from 'console';

export class AssessorService {
    static async getAssessors(page: number = 1, limit: number = 10): Promise<{ data: AssessorResponse[]; meta: PagingMeta }> {
        const offset = (page - 1) * limit;
        const assessors = await db.select().from(assessorTable).limit(limit).offset(offset);
        const userIds = assessors.map(a => a.user_id);
        const schemeIds = assessors.map(a => a.scheme_id);
        const users = userIds.length ? await db.select().from(userTable) : [];
        const roles = await db.select().from(roleTable);
        const schemes = schemeIds.length ? await db.select().from(schemeTable) : [];
        const roleById = new Map(roles.map(r => [r.id, r]));
        const userById = new Map(users.map(u => [u.id, u]));
        const schemeById = new Map(schemes.map(s => [s.id, s]));

        const { sql } = await import('drizzle-orm');
        const countRows = await db.select({ count: sql<number>`COUNT(*)` }).from(assessorTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const data = assessors.map(a => this.formatAssessorResponse({
            ...a,
            user: { ...userById.get(a.user_id), role: roleById.get(userById.get(a.user_id)?.role_id as number) },
            scheme: schemeById.get(a.scheme_id),
        } as any));

        return { data, meta: { current_page: page, limit, total, total_pages: totalPages } };
    }

    static async getAllAssessors(): Promise<AssessorResponse[]> {
        const assessors = await db.select().from(assessorTable);
        const users = await db.select().from(userTable);
        const roles = await db.select().from(roleTable);
        const schemes = await db.select().from(schemeTable);
        const roleById = new Map(roles.map(r => [r.id, r]));
        const userById = new Map(users.map(u => [u.id, u]));
        const schemeById = new Map(schemes.map(s => [s.id, s]));
        return assessors.map(a => this.formatAssessorResponse({
            ...a,
            user: { ...userById.get(a.user_id), role: roleById.get(userById.get(a.user_id)?.role_id as number) },
            scheme: schemeById.get(a.scheme_id)
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

    static async createOrUpdateAssessorDetail(params: {
        assessorId: number;
        bodyData: any;
        files: any[];
    }): Promise<any> {
        const { assessorId, bodyData, files } = params;
        const BASE_URL = "https://asessment24.site";

        const fileData: Record<string, string> = {};

        const fileArray = Array.isArray(files) ? files : [];
        for (const file of fileArray) {
            const fieldName = file.fieldname;
            if (['tax_id_number', 'bank_book_cover', 'certificate', 'id_card', 'national_id'].includes(fieldName)) {
                fileData[fieldName] = `${BASE_URL}/twodev/uploads/assessor/assessor-${assessorId}/${file.filename}`;
            }
        }

        for (const key of Object.keys(bodyData || {})) {
            if (['tax_id_number', 'bank_book_cover', 'certificate', 'id_card', 'national_id'].includes(key) && bodyData[key]) {
                fileData[key] = bodyData[key];
            }
        }

        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, assessorId) });
        if (!assessor) throw new NotFoundError('Assessor');

        const existingDetail = await db.query.assessorDetail.findFirst({
            where: eq(assessorDetailTable.assessor_id, assessorId)
        });

        const detailData = {
            assessor_id: assessorId,
            tax_id_number: fileData.tax_id_number || bodyData.tax_id_number || '',
            bank_book_cover: fileData.bank_book_cover || bodyData.bank_book_cover || '',
            certificate: fileData.certificate || bodyData.certificate || '',
            national_id: fileData.national_id || bodyData.national_id || '',
            id_card: fileData.id_card || bodyData.id_card || ''
        };

        if (existingDetail) {
            await db.update(assessorDetailTable)
                .set(detailData)
                .where(eq(assessorDetailTable.id, existingDetail.id));

            const updated = await db.query.assessorDetail.findFirst({
                where: eq(assessorDetailTable.id, existingDetail.id)
            });
            return updated;
        } else {
            await db.insert(assessorDetailTable).values(detailData);

            const newDetail = await db.query.assessorDetail.findFirst({
                where: eq(assessorDetailTable.assessor_id, assessorId)
            });
            return newDetail;
        }
    }

    static async getAssessorDetail(assessorId: number): Promise<any> {
        const detail = await db.query.assessorDetail.findFirst({
            where: eq(assessorDetailTable.assessor_id, assessorId)
        });
        if (!detail) throw new NotFoundError('Assessor Detail');

        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, assessorId) });
        const user = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;

        return {
            ...detail,
            assessor: assessor ? {
                ...assessor,
                user: user
            } : null
        };
    }

    static async getAllAssessorDetails(): Promise<any[]> {
        const details = await db.select()
            .from(assessorDetailTable)
            .innerJoin(assessorTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
            .innerJoin(userTable, eq(assessorTable.user_id, userTable.id));

        return details.map(row => ({
            ...row.assessor_detail,
            assessor: {
                ...row.assessor,
                user: row.user
            }
        }));
    }

    static async getAssessorUsers(page: number = 1, limit: number = 10): Promise<{ data: { id: number; full_name: string; email: string; role: string; status: string }[], meta: PagingMeta }> {
        const offset = (page - 1) * limit;
        const users = await db.select({
            id: userTable.id,
            full_name: userTable.full_name,
            email: userTable.email,
            role: roleTable.name,
            has_assessor_data: assessorTable.id
        })
        .from(userTable)
        .innerJoin(roleTable, eq(userTable.role_id, roleTable.id))
        .leftJoin(assessorTable, eq(userTable.id, assessorTable.user_id))
        .where(eq(roleTable.name, 'Assessor'))
        .orderBy(asc(userTable.full_name), asc(userTable.created_at))
        .limit(limit)
        .offset(offset);

        const results = users.map(u => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            role: u.role,
            status: u.has_assessor_data ? 'Lengkap' : 'Belum Lengkap'
        }));

        const allUsers = await db.select({ count: sql<number>`COUNT(*)` })
            .from(userTable)
            .innerJoin(roleTable, eq(userTable.role_id, roleTable.id))
            .leftJoin(assessorTable, eq(userTable.id, assessorTable.user_id))
            .where(eq(roleTable.name, 'Assessor'));
        const total = Number(allUsers?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const meta: PagingMeta = {
            current_page: page,
            limit,
            total,
            total_pages: totalPages
        };

        return { data: results, meta };
    }


    private static formatAssessorResponse(assessor: any): AssessorResponse {
        return {
            id: assessor.id,
            user_id: assessor.user_id,
            scheme_id: assessor.scheme_id,
            name: assessor.user.full_name,
            address: assessor.address,
            phone_no: assessor.phone_no,
            birth_date: assessor.birth_date,
            no_reg_met: assessor.no_reg_met
        };
    }
}