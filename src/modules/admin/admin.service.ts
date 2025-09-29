import { db } from '../../config/drizzle';
import { admin as adminTable, user as userTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

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
};


