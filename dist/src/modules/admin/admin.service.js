"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../../common/error");
exports.AdminService = {
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield drizzle_1.db.select().from(schema_1.admin).leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.user.id, schema_1.admin.user_id));
            return rows.map((r) => (Object.assign(Object.assign({}, r.admin), { user: r.user })));
        });
    },
    getAdminById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, id) });
            if (!row)
                return null;
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, row.user_id) });
            return Object.assign(Object.assign({}, row), { user });
        });
    },
    createAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, data.user_id) });
            if (!existingUser) {
                throw new Error('User tidak ditemukan');
            }
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, data.user_id) });
            if (existingAdmin) {
                throw new error_1.DuplicateEntryError('Admin', `User ID ${data.user_id}`);
            }
            yield drizzle_1.db.insert(schema_1.admin).values({
                user_id: data.user_id,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date),
            });
            const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, data.user_id) });
            if (!admin) {
                throw new Error('Gagal membuat admin');
            }
            return Object.assign(Object.assign({}, admin), { user: existingUser });
        });
    },
    updateAdmin(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, id) });
            if (!existingAdmin) {
                throw new error_1.NotFoundError(`Admin dengan ID ${id}`);
            }
            const updateData = {};
            if (data.address !== undefined)
                updateData.address = data.address;
            if (data.phone_no !== undefined)
                updateData.phone_no = data.phone_no;
            if (data.birth_date !== undefined)
                updateData.birth_date = new Date(data.birth_date);
            // Update admin record
            yield drizzle_1.db.update(schema_1.admin).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.admin.id, id));
            // Get updated admin with user data
            const updatedAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, id) });
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, updatedAdmin.user_id) });
            return Object.assign(Object.assign({}, updatedAdmin), { user });
        });
    },
    deleteAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if admin exists
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, id) });
            if (!existingAdmin) {
                throw new error_1.NotFoundError(`Admin dengan ID ${id}`);
            }
            // Delete admin record
            yield drizzle_1.db.delete(schema_1.admin).where((0, drizzle_orm_1.eq)(schema_1.admin.id, id));
            return { id, message: 'Admin berhasil dihapus' };
        });
    },
};
