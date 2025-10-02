import { db } from '../../config/drizzle';
import { admin as adminTable, user as userTable, role as roleTable } from '../../../drizzle/schema';
import { eq, and, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { DuplicateEntryError, NotFoundError } from '../../common/error';

export const AdminService = {
    async getAdmins() {
        const rows = await db.select({
            id: adminTable.id,
            user_id: adminTable.user_id,
            address: adminTable.address,
            phone_no: adminTable.phone_no,
            birth_date: adminTable.birth_date,
            created_at: adminTable.created_at,
            updated_at: adminTable.updated_at,
            full_name: userTable.full_name,
            email: userTable.email,
            role_id: userTable.role_id
        })
        .from(adminTable)
        .leftJoin(userTable, eq(adminTable.user_id, userTable.id));
        
        return rows.map((r) => ({
            id: r.id,
            user_id: r.user_id,
            address: r.address,
            phone_no: r.phone_no,
            birth_date: r.birth_date,
            created_at: r.created_at,
            updated_at: r.updated_at,
            full_name: r.full_name,
            email: r.email,
            role_id: r.role_id
        }));
    },

    async getAdminById(id: number) {
        const [row] = await db.select({
            id: adminTable.id,
            user_id: adminTable.user_id,
            address: adminTable.address,
            phone_no: adminTable.phone_no,
            birth_date: adminTable.birth_date,
            created_at: adminTable.created_at,
            updated_at: adminTable.updated_at,
            full_name: userTable.full_name,
            email: userTable.email,
            role_id: userTable.role_id
        })
        .from(adminTable)
        .leftJoin(userTable, eq(adminTable.user_id, userTable.id))
        .where(eq(adminTable.id, id));
        
        if (!row) return null;
        
        return {
            id: row.id,
            user_id: row.user_id,
            address: row.address,
            phone_no: row.phone_no,
            birth_date: row.birth_date,
            created_at: row.created_at,
            updated_at: row.updated_at,
            full_name: row.full_name,
            email: row.email,
            role_id: row.role_id
        };
    },

    async createAdmin(data: {
        full_name: string;
        email: string;
        password: string;
        role_id?: number;
        address: string;
        phone_no: string;
        birth_date: string;
    }) {
        const existingUser = await db.query.user.findFirst({ where: eq(userTable.email, data.email) });
        if (existingUser) {
            throw new DuplicateEntryError('Email', data.email);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const [userId] = await db.insert(userTable).values({
            full_name: data.full_name,
            email: data.email,
            password: hashedPassword,
            role_id: data.role_id || 1,
        }).$returningId();

        await db.insert(adminTable).values({
            user_id: userId.id,
            address: data.address,
            phone_no: data.phone_no,
            birth_date: new Date(data.birth_date),
        });

        const [admin] = await db.select({
            id: adminTable.id,
            user_id: adminTable.user_id,
            address: adminTable.address,
            phone_no: adminTable.phone_no,
            birth_date: adminTable.birth_date,
            created_at: adminTable.created_at,
            updated_at: adminTable.updated_at,
            full_name: userTable.full_name,
            email: userTable.email,
            role_id: userTable.role_id
        })
        .from(adminTable)
        .leftJoin(userTable, eq(adminTable.user_id, userTable.id))
        .where(eq(adminTable.user_id, userId.id));
        
        if (!admin) {
            throw new Error('Gagal membuat admin');
        }

        return {
            id: admin.id,
            user_id: admin.user_id,
            address: admin.address,
            phone_no: admin.phone_no,
            birth_date: admin.birth_date,
            created_at: admin.created_at,
            updated_at: admin.updated_at,
            full_name: admin.full_name,
            email: admin.email,
            role_id: admin.role_id
        };
    },

    async updateAdmin(id: number, data: {
        full_name?: string;
        email?: string;
        address?: string;
        phone_no?: string;
        birth_date?: string;
    }) {
        const existingAdmin = await db.query.admin.findFirst({ where: eq(adminTable.id, id) });
        if (!existingAdmin) {
            throw new NotFoundError(`Admin dengan ID ${id}`);
        }

        const adminUpdateData: any = {};
        if (data.address !== undefined) adminUpdateData.address = data.address;
        if (data.phone_no !== undefined) adminUpdateData.phone_no = data.phone_no;
        if (data.birth_date !== undefined) adminUpdateData.birth_date = new Date(data.birth_date);

        const userUpdateData: any = {};
        if (data.full_name !== undefined) userUpdateData.full_name = data.full_name;
        if (data.email !== undefined) {
            const emailExists = await db.query.user.findFirst({ 
                where: and(
                    eq(userTable.email, data.email),
                    ne(userTable.id, existingAdmin.user_id)
                )
            });
            if (emailExists) {
                throw new DuplicateEntryError('Email', data.email);
            }
            userUpdateData.email = data.email;
        }

        if (Object.keys(adminUpdateData).length > 0) {
            await db.update(adminTable).set(adminUpdateData).where(eq(adminTable.id, id));
        }

        if (Object.keys(userUpdateData).length > 0) {
            await db.update(userTable).set(userUpdateData).where(eq(userTable.id, existingAdmin.user_id));
        }

        const [updatedAdmin] = await db.select({
            id: adminTable.id,
            user_id: adminTable.user_id,
            address: adminTable.address,
            phone_no: adminTable.phone_no,
            birth_date: adminTable.birth_date,
            created_at: adminTable.created_at,
            updated_at: adminTable.updated_at,
            full_name: userTable.full_name,
            email: userTable.email,
            role_id: userTable.role_id
        })
        .from(adminTable)
        .leftJoin(userTable, eq(adminTable.user_id, userTable.id))
        .where(eq(adminTable.id, id));

        return {
            id: updatedAdmin.id,
            user_id: updatedAdmin.user_id,
            address: updatedAdmin.address,
            phone_no: updatedAdmin.phone_no,
            birth_date: updatedAdmin.birth_date,
            created_at: updatedAdmin.created_at,
            updated_at: updatedAdmin.updated_at,
            full_name: updatedAdmin.full_name,
            email: updatedAdmin.email,
            role_id: updatedAdmin.role_id
        };
    },

    async deleteAdmin(id: number) {
        const existingAdmin = await db.query.admin.findFirst({ where: eq(adminTable.id, id) });
        if (!existingAdmin) {
            throw new NotFoundError(`Admin dengan ID ${id}`);
        }

        await db.delete(adminTable).where(eq(adminTable.id, id));

        return { id, message: 'Admin berhasil dihapus' };
    },

    async updateAdminByUserId(userId: number, data: {
        full_name?: string;
        email?: string;
        password?: string;
        address?: string;
        phone_no?: string;
        birth_date?: string;
    }) {
        const existingAdmin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, userId) });
        if (!existingAdmin) {
            throw new NotFoundError(`Admin dengan User ID ${userId}`);
        }

        const adminUpdateData: any = {};
        if (data.address !== undefined) adminUpdateData.address = data.address;
        if (data.phone_no !== undefined) adminUpdateData.phone_no = data.phone_no;
        if (data.birth_date !== undefined) adminUpdateData.birth_date = new Date(data.birth_date);

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

        if (Object.keys(adminUpdateData).length > 0) {
            await db.update(adminTable).set(adminUpdateData).where(eq(adminTable.user_id, userId));
        }

        if (Object.keys(userUpdateData).length > 0) {
            await db.update(userTable).set(userUpdateData).where(eq(userTable.id, userId));
        }

        const [updatedAdmin] = await db.select({
            id: adminTable.id,
            user_id: adminTable.user_id,
            address: adminTable.address,
            phone_no: adminTable.phone_no,
            birth_date: adminTable.birth_date,
            created_at: adminTable.created_at,
            updated_at: adminTable.updated_at,
            full_name: userTable.full_name,
            email: userTable.email,
            role_id: userTable.role_id
        })
        .from(adminTable)
        .leftJoin(userTable, eq(adminTable.user_id, userTable.id))
        .where(eq(adminTable.user_id, userId));

        return {
            id: updatedAdmin.id,
            user_id: updatedAdmin.user_id,
            address: updatedAdmin.address,
            phone_no: updatedAdmin.phone_no,
            birth_date: updatedAdmin.birth_date,
            created_at: updatedAdmin.created_at,
            updated_at: updatedAdmin.updated_at,
            full_name: updatedAdmin.full_name,
            email: updatedAdmin.email,
            role_id: updatedAdmin.role_id
        };
    },
};


