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
            // Check if user exists
            const existingUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, data.user_id) });
            if (!existingUser) {
                throw new Error('User tidak ditemukan');
            }
            // Check if user already has admin record
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, data.user_id) });
            if (existingAdmin) {
                throw new error_1.DuplicateEntryError('Admin', `User ID ${data.user_id}`);
            }
            // Create admin record
            yield drizzle_1.db.insert(schema_1.admin).values({
                user_id: data.user_id,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date),
            });
            // Get the created admin with user data
            const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, data.user_id) });
            if (!admin) {
                throw new Error('Gagal membuat admin');
            }
            return Object.assign(Object.assign({}, admin), { user: existingUser });
        });
    },
};
