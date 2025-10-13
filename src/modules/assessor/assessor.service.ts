import { db } from '../../config/drizzle';
import { NotFoundError, DuplicateEntryError, ValidationError } from '../../common/error';
import { AssessorResponse, AssessorRequest } from './assessor.type';
import { assessor as assessorTable, user as userTable, role as roleTable, scheme as schemeTable, assessorDetail as assessorDetailTable } from '../../../drizzle/schema';
import { and, asc, eq, like, or, sql, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { rm } from "fs/promises";
import fs from 'fs';
import path from 'path';
import { PagingMeta } from '../../helper/type';

export class AssessorService {
    static async getAssessors(page: number = 1, limit: number = 10, keyword?: string): Promise<{ data: AssessorResponse[]; meta: PagingMeta }> {
        const offset = (page - 1) * limit;
        const assessors = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            email: userTable.email,
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
            .innerJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
            .where(
                or(
                    keyword ? like(userTable.full_name, `%${keyword}%`) : undefined,
                    keyword ? like(userTable.email, `%${keyword}%`) : undefined
                )
            )
            .limit(limit)
            .offset(offset);

        const countRows = await db.select({ count: sql<number>`COUNT(*)` }).from(assessorTable);
        const total = Number(countRows?.[0]?.count ?? 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const data = assessors.map(a => this.formatAssessorResponse(a));

        return { data, meta: { current_page: page, limit, total, total_pages: totalPages } };
    }

    static async getAllAssessors(keyword?: string): Promise<{ data: AssessorResponse[] }> {
        const assessors = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            email: userTable.email,
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
            .innerJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
            .where(
                or(
                    keyword ? like(userTable.full_name, `%${keyword}%`) : undefined,
                    keyword ? like(userTable.email, `%${keyword}%`) : undefined
                )
            );
    
        const data = assessors.map(a => this.formatAssessorResponse(a));
    
        return { data };
    }
    

    static async getAssessorById(id: number): Promise<any> {
        const [assessor] = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            email: userTable.email,
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
            .innerJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
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
            email: userTable.email,
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
            .innerJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
            .where(eq(assessorTable.user_id, user_id));

        if (!assessor) throw new NotFoundError('Assessor');
        return this.formatAssessorResponse(assessor);
    }

    static async createAssessor(
        data: AssessorRequest,
        files: any[]
    ): Promise<AssessorResponse> {
        const user = await db.query.user.findFirst({ where: eq(userTable.id, data.user_id) });
        if (!user || user.role_id !== 2) {
            for (const file of files) {
                const oldPath = path.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            throw user ? new Error('User bukan assessor') : new NotFoundError('User');
        }

        let assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, data.user_id) });
        if (assessor) {
            await db.update(assessorTable).set({
                scheme_id: data.scheme_id,
                no_reg_met: data.no_reg_met,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date) as any
            })
        } else {
            const [id] = await db.insert(assessorTable).values({
                user_id: data.user_id,
                scheme_id: data.scheme_id,
                no_reg_met: data.no_reg_met,
                institution: data.institution,
                address: data.address,
                phone_no: data.phone_no,
                birth_location: data.birth_location,
                birth_date: new Date(data.birth_date) as any,
            }).$returningId();
            assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, Number(id.id)) });
        }
        if (!assessor) throw new NotFoundError('Assessor');

        if (data.name && data.email) {
            try {
                const userEmailAssessor = await db.query.user.findFirst({ where: eq(userTable.email, data.email) });

                if (!userEmailAssessor) {
                    await db.update(userTable).set({
                        full_name: data.name,
                        email: data.email
                    })
                        .where(eq(userTable.id, assessor.user_id));
                } else if (userEmailAssessor.id !== assessor.user_id) {
                    await db.update(userTable).set({
                        full_name: data.name,
                        email: data.email
                    })
                        .where(eq(userTable.id, assessor.user_id));
                } else if (userEmailAssessor.id === assessor.user_id) {
                    await db.update(userTable).set({
                        full_name: data.name
                    })
                        .where(eq(userTable.id, assessor.user_id));
                }
            } catch (error) {
                for (const file of files) {
                    const oldPath = path.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                throw error;
            }
        }

        // Pindahkan file dari folder default ke folder final setelah id diketahui
        const newDir = path.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessor.id}`);
        if (fs.existsSync(newDir)) {
            for (const fileName of fs.readdirSync(newDir)) {
                const filePath = path.join(newDir, fileName);
                try {
                    fs.unlinkSync(filePath);
                } catch { }
            }
        }

        for (const file of files) {
            const oldPath = path.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
            const newPath = path.join(newDir, file.filename);

            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir, { recursive: true });
            }

            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
            }
        }

        try {
            await this.createOrUpdateAssessorDetail({
                assessorId: assessor.id,
                bodyData: data,
                files
            });

        } catch (error: any) {
            await db.delete(assessorTable).where(eq(assessorTable.id, assessor.id));
            throw new Error(error.message);
        }


        const [assessorResponse] = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            email: userTable.email,
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
            .innerJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
            .where(eq(assessorTable.id, assessor.id));

        return this.formatAssessorResponse(assessorResponse);
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
        const BASE_URL = "https://lspsmkn24jakarta.com";
        const UPLOAD_DIR = path.join(__dirname, `../../../../public/uploads/assessor/assessor-${assessorId}`);

        const requiredFields = ['tax_id_number', 'bank_book_cover', 'certificate', 'id_card', 'national_id'];
        const fileData: Record<string, string> = {};

        try {
            const fileArray = Array.isArray(files) ? files : [];

            // When creating (no existing detail), require all five files
            const existingDetail = await db.query.assessorDetail.findFirst({
                where: eq(assessorDetailTable.assessor_id, assessorId)
            });

            // Build fileData from uploaded files (moved to final dir) and/or bodyData overrides
            for (const file of fileArray) {
                if (requiredFields.includes(file.fieldname)) {
                    fileData[file.fieldname] = `${BASE_URL}/twodev/uploads/assessor/assessor-${assessorId}/${file.filename}`;
                }
            }

            for (const key of Object.keys(bodyData || {})) {
                if (requiredFields.includes(key) && bodyData[key]) {
                    fileData[key] = bodyData[key];
                }
            }

            if (!existingDetail) {
                for (const field of requiredFields) {
                    if (!fileData[field]) {
                        throw new ValidationError(`Field ${field} harus diisi`);
                    }
                }
            } else {
                for (const field of requiredFields) {
                    if (!fileData[field]) {
                        const existingValue = (existingDetail as any)[field];
                        if (existingValue) fileData[field] = existingValue;
                    }
                }
            }

            const existingAssessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, assessorId) });
            if (!existingAssessor) {
                throw new NotFoundError('Assessor');
            }

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
                const [inserted] = await db.insert(assessorDetailTable).values(detailData).$returningId();

                const created = await db.query.assessorDetail.findFirst({
                    where: eq(assessorDetailTable.id, inserted.id)
                });

                return created;
            }
        } catch (error: any) {
            await db.delete(assessorDetailTable).where(eq(assessorDetailTable.assessor_id, assessorId));
            try {
                await rm(UPLOAD_DIR, { recursive: true, force: true });
            } catch (error) {
            }
            throw new Error(error.message);
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

    static async getAssessorUsers(page: number = 1, limit: number = 10, keyword?: string): Promise<{ data: { id: number; full_name: string; email: string; role: string; status: string }[], meta: PagingMeta }> {
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
            .where(
                and(
                    eq(roleTable.name, 'Assessor'),
                    or(
                        keyword ? like(userTable.full_name, `%${keyword}%`) : undefined,
                        keyword ? like(userTable.email, `%${keyword}%`) : undefined
                    )
                )
            )
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

    static async updateAssessorByUserId(userId: number, data: {
        full_name?: string;
        email?: string;
        password?: string;
        scheme_id?: number;
        birth_location?: string;
        birth_date?: string;
        no_reg_met?: string;
        institution?: string;
        address?: string;
        phone_no?: string;
    }, files: any[] = []): Promise<AssessorResponse> {
        const existingAssessor = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, userId) });
        if (!existingAssessor) {
            throw new NotFoundError(`Assessor dengan User ID ${userId}`);
        }

        const assessorUpdateData: any = {};
        if (data.scheme_id !== undefined) assessorUpdateData.scheme_id = data.scheme_id;
        if (data.birth_location !== undefined) assessorUpdateData.birth_location = data.birth_location;
        if (data.birth_date !== undefined) assessorUpdateData.birth_date = new Date(data.birth_date);
        if (data.no_reg_met !== undefined) assessorUpdateData.no_reg_met = data.no_reg_met;
        if (data.institution !== undefined) assessorUpdateData.institution = data.institution;
        if (data.address !== undefined) assessorUpdateData.address = data.address;
        if (data.phone_no !== undefined) assessorUpdateData.phone_no = data.phone_no;

        const userUpdateData: any = {};
        if (data.full_name !== undefined) userUpdateData.full_name = data.full_name;
        if (data.email !== undefined) {
            const emailExists = await db.query.user.findFirst({ 
                where: and(
                    eq(userTable.email, data.email),
                    ne(userTable.id, userId)
                )
            });
            if (emailExists) {
                throw new DuplicateEntryError('Email', data.email);
            }
            userUpdateData.email = data.email;
        }
        if (data.password !== undefined) {
            userUpdateData.password = await bcrypt.hash(data.password, 10);
        }

        if (Object.keys(assessorUpdateData).length > 0) {
            await db.update(assessorTable).set(assessorUpdateData).where(eq(assessorTable.user_id, userId));
        }

        if (Object.keys(userUpdateData).length > 0) {
            await db.update(userTable).set(userUpdateData).where(eq(userTable.id, userId));
        }

        if (files && files.length > 0) {
            const assessorId = existingAssessor.id;
            const targetDir = path.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessorId}`);
            
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const existingDetail = await db.query.assessorDetail.findFirst({
                where: eq(assessorDetailTable.assessor_id, assessorId)
            });

            for (const file of files) {
                const fieldName = file.fieldname as keyof typeof existingDetail | string;

                try {
                    const previousUrl = (existingDetail as any)?.[fieldName];
                    if (typeof previousUrl === 'string' && previousUrl.length > 0) {
                        const previousFileName = previousUrl.split('/').pop();
                        if (previousFileName) {
                            const previousPath = path.join(targetDir, previousFileName);
                            if (fs.existsSync(previousPath)) {
                                fs.unlinkSync(previousPath);
                            }
                        }
                    }
                } catch {}

                const oldPath = path.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                const newPath = path.join(targetDir, file.filename);

                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                }
            }

            try {
                await this.createOrUpdateAssessorDetail({
                    assessorId: assessorId,
                    bodyData: data,
                    files
                });
            } catch (error: any) {
            }
        }

        const [updatedAssessor] = await db.select({
            id: assessorTable.id,
            user_id: assessorTable.user_id,
            scheme_id: assessorTable.scheme_id,
            name: userTable.full_name,
            email: userTable.email,
            birth_location: assessorTable.birth_location,
            birth_date: assessorTable.birth_date,
            no_reg_met: assessorTable.no_reg_met,
            institution: assessorTable.institution,
            address: assessorTable.address,
            phone_no: assessorTable.phone_no,
            created_at: assessorTable.created_at,
            updated_at: assessorTable.updated_at,
            scheme: schemeTable,
            detail: assessorDetailTable
        })
        .from(assessorTable)
        .leftJoin(userTable, eq(assessorTable.user_id, userTable.id))
        .innerJoin(schemeTable, eq(assessorTable.scheme_id, schemeTable.id))
        .leftJoin(assessorDetailTable, eq(assessorDetailTable.assessor_id, assessorTable.id))
        .where(eq(assessorTable.user_id, userId));

        return this.formatAssessorResponse(updatedAssessor);
    }

    private static formatAssessorResponse(assessor: any): AssessorResponse {
        return {
            id: assessor.id,
            user_id: assessor.user_id,
            name: assessor.name,
            email: assessor.email,
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