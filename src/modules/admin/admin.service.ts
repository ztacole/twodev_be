import { db } from '../../config/drizzle';
import { admin as adminTable, user as userTable, role as roleTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { DuplicateEntryError, NotFoundError } from '../../common/error';

export const AdminService = {
    async getAdmins() {
        const rows = await db.select().from(adminTable).leftJoin(userTable, eq(userTable.id, adminTable.user_id));
        return rows.map((r) => ({
            ...r.admin,
            user: r.user,
        }));
    },

    async getAdminById(id: number) {
        const row = await db.query.admin.findFirst({ where: eq(adminTable.id, id) });
        if (!row) return null;
        const user = await db.query.user.findFirst({ where: eq(userTable.id, row.user_id) });
        return { ...row, user };
    },

    async createAdmin(data: {
        user_id: number;
        address: string;
        phone_no: string;
        birth_date: string;
    }) {
        const existingUser = await db.query.user.findFirst({ where: eq(userTable.id, data.user_id) });
        if (!existingUser) {
            throw new Error('User tidak ditemukan');
        }

        const existingAdmin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, data.user_id) });
        if (existingAdmin) {
            throw new DuplicateEntryError('Admin', `User ID ${data.user_id}`);
        }

        await db.insert(adminTable).values({
            user_id: data.user_id,
            address: data.address,
            phone_no: data.phone_no,
            birth_date: new Date(data.birth_date),
        });

        const admin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, data.user_id) });
        if (!admin) {
            throw new Error('Gagal membuat admin');
        }

        return {
            ...admin,
            user: existingUser,
        };
    },

    async updateAdmin(id: number, data: {
        address?: string;
        phone_no?: string;
        birth_date?: string;
    }) {
        const existingAdmin = await db.query.admin.findFirst({ where: eq(adminTable.id, id) });
        if (!existingAdmin) {
            throw new NotFoundError(`Admin dengan ID ${id}`);
        }

        const updateData: any = {};
        if (data.address !== undefined) updateData.address = data.address;
        if (data.phone_no !== undefined) updateData.phone_no = data.phone_no;
        if (data.birth_date !== undefined) updateData.birth_date = new Date(data.birth_date);

        // Update admin record
        await db.update(adminTable).set(updateData).where(eq(adminTable.id, id));

        // Get updated admin with user data
        const updatedAdmin = await db.query.admin.findFirst({ where: eq(adminTable.id, id) });
        const user = await db.query.user.findFirst({ where: eq(userTable.id, updatedAdmin!.user_id) });

        return {
            ...updatedAdmin,
            user,
        };
    },

    async deleteAdmin(id: number) {
        // Check if admin exists
        const existingAdmin = await db.query.admin.findFirst({ where: eq(adminTable.id, id) });
        if (!existingAdmin) {
            throw new NotFoundError(`Admin dengan ID ${id}`);
        }

        // Delete admin record
        await db.delete(adminTable).where(eq(adminTable.id, id));

        return { id, message: 'Admin berhasil dihapus' };
    },
};


