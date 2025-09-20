import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError, ValidationError } from '../../common/error';
import { AssessorResponse, AssessorRequest } from './assessor.type';
import { assessor as assessorTable, user as userTable, role as roleTable, scheme as schemeTable, assessorDetail as assessorDetailTable } from '../../../drizzle/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import { rm } from "fs/promises";
import fs from 'fs';
import path from 'path';
import { PagingMeta } from '../../helper/type';
import { count } from 'console';
import { de } from '@faker-js/faker/.';

export class AssessorService {
    static async getAssessors(page: number = 1, limit: number = 10): Promise<{ data: AssessorResponse[]; meta: PagingMeta }> {
        const offset = (page - 1) * limit;
        const assessors = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            birth_location: assessorTable.birth_location,
            birth_date: assessorTable.birth_date,
            no_reg_met: assessorTable.no_reg_met,
            institution: assessorTable.institution,
            address: assessorTable.address,
            phone_no: assessorTable.phone_no,
            scheme: schemeTable,
            detail: assessorDetailTable
        })
        .from(assessorTable)
        .leftJoin(userTable, eq(assessorTable.user_id, userTable.id))
        .innerJoin(schemeTable, eq(assessorTable.scheme_id, schemeTable.id))
        .leftJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
        .limit(limit)
        .offset(offset);

        const countRows = await db.select({ count: sql<number>`COUNT(*)` }).from(assessorTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const data = assessors.map(a => this.formatAssessorResponse(a));

        return { data, meta: { current_page: page, limit, total, total_pages: totalPages } };
    }

    static async getAssessorById(id: number): Promise<any> {
        const [assessor] = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            birth_location: assessorTable.birth_location,
            birth_date: assessorTable.birth_date,
            no_reg_met: assessorTable.no_reg_met,
            institution: assessorTable.institution,
            address: assessorTable.address,
            phone_no: assessorTable.phone_no,
            scheme: schemeTable,
            detail: assessorDetailTable
        })
        .from(assessorTable)
        .leftJoin(userTable, eq(assessorTable.user_id, userTable.id))
        .innerJoin(schemeTable, eq(assessorTable.scheme_id, schemeTable.id))
        .leftJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
        .where(eq(assessorTable.id, id));

        if (!assessor) throw new NotFoundError('Assessor');
        return this.formatAssessorResponse(assessor);
    }

    static async getAssessorByUserId(user_id: number): Promise<any> {
        const [assessor] = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            birth_location: assessorTable.birth_location,
            birth_date: assessorTable.birth_date,
            no_reg_met: assessorTable.no_reg_met,
            institution: assessorTable.institution,
            address: assessorTable.address,
            phone_no: assessorTable.phone_no,
            scheme: schemeTable,
            detail: assessorDetailTable
        })
        .from(assessorTable)
        .leftJoin(userTable, eq(assessorTable.user_id, userTable.id))
        .innerJoin(schemeTable, eq(assessorTable.scheme_id, schemeTable.id))
        .leftJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
        .where(eq(assessorTable.user_id, user_id));

        if (!assessor) throw new NotFoundError('Assessor');
        return this.formatAssessorResponse(assessor);
    }

    static async createAssessor(data: AssessorRequest): Promise<AssessorResponse> {
        const user = await db.query.user.findFirst({ where: eq(userTable.id, data.user_id) });
        if(!user) throw new NotFoundError('User');

        if(user?.role_id !== 2) {
            throw new Error('User bukan assessor');
        }

        const existingAssessor = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, data.user_id) });
        if (existingAssessor) {
            await db.update(assessorTable).set({
                scheme_id: data.scheme_id,
                no_reg_met: data.no_reg_met,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date) as any
            })

            const created = await db.query.assessor.findFirst({ where: and(eq(assessorTable.user_id, data.user_id), eq(assessorTable.scheme_id, data.scheme_id)) });
            if (!created) throw new NotFoundError('Assessor');
            const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) }) : null;
            const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, created.scheme_id) });
            return this.formatAssessorResponse({ ...created, user: { ...user, role }, scheme } as any);
        }

        await db.insert(assessorTable).values({
            user_id: data.user_id,
            scheme_id: data.scheme_id,
            no_reg_met: data.no_reg_met,
            institution: data.institution,
            address: data.address,
            phone_no: data.phone_no,
            birth_location: data.birth_location,
            birth_date: new Date(data.birth_date) as any,
        });
        const created = await db.query.assessor.findFirst({ where: and(eq(assessorTable.user_id, data.user_id), eq(assessorTable.scheme_id, data.scheme_id)) });
        if (!created) throw new NotFoundError('Assessor');
        
        const role = user ? await db.query.role.findFirst({ where: eq(roleTable.id, user.role_id) }) : null;
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, created.scheme_id) });
        return this.formatAssessorResponse({ ...created, user: { ...user, role }, scheme } as any);
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
        const UPLOAD_DIR = path.join(__dirname, `../../../../public/uploads/assessor/assessor-${assessorId}`);
        
        const requiredFields = ['tax_id_number', 'bank_book_cover', 'certificate', 'id_card', 'national_id'];
        const fileData: Record<string, string> = {};

        try {
            const fileArray = Array.isArray(files) ? files : [];
            if(fileArray.length < 5) {
                throw new Error('File tidak boleh kurang dari 5');
            }
    
            for (const file of fileArray) {
                if(requiredFields.includes(file.fieldname)) {
                    fileData[file.filename] = `${BASE_URL}/twodev/uploads/assessor/assessor-${assessorId}/${file.filename}`;
                }
            }
    
            for (const key of Object.keys(bodyData || {})) {
                if (requiredFields.includes(key) && bodyData[key]) {
                    fileData[key] = bodyData[key];
                }
            }

            for(const field of requiredFields) {
                if(!fileData[field] && !bodyData[field]) {
                    throw new ValidationError(`Field ${field} harus diisi`);
                }
            }
    
            const existingAssessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, assessorId) });
            if (!existingAssessor) {
                throw new NotFoundError('Assessor');
            }
    
            const existingDetail = await db.query.assessorDetail.findFirst({
                where: eq(assessorDetailTable.assessor_id, assessorId)
            });
    
            const detailData = {
                assessor_id: assessorId,
                tax_id_number: fileData.tax_id_number,
                bank_book_cover: fileData.bank_book_cover,
                certificate: fileData.certificate,
                national_id: fileData.national_id,
                id_card: fileData.id_card
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
    
                const created = await db.query.assessorDetail.findFirst({
                    where: eq(assessorDetailTable.assessor_id, assessorId)
                });
    
                return created;
            }
        } catch (error) {
            await db.delete(assessorDetailTable).where(eq(assessorDetailTable.assessor_id, assessorId));

            try {
                await rm(UPLOAD_DIR, { recursive: true, force: true });
            } catch (error) {
                console.log(error);
            }
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
        .leftJoin(assessorDetailTable, eq(assessorTable.id, assessorDetailTable.assessor_id))
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
            name: assessor.name,
            birth_location: assessor.birth_location,
            birth_date: assessor.birth_date,
            no_reg_met: assessor.no_reg_met,
            institution: assessor.institution,
            address: assessor.address,
            phone_no: assessor.phone_no,
            scheme: assessor.scheme,
            detail: assessor.detail || null
        };
    }
}