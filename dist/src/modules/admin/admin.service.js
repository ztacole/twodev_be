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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_1 = require("../../common/error");
exports.AdminService = {
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield drizzle_1.db.select({
                id: schema_1.admin.id,
                user_id: schema_1.admin.user_id,
                address: schema_1.admin.address,
                phone_no: schema_1.admin.phone_no,
                birth_date: schema_1.admin.birth_date,
                can_approve: schema_1.admin.can_approve,
                created_at: schema_1.admin.created_at,
                updated_at: schema_1.admin.updated_at,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role_id: schema_1.user.role_id
            })
                .from(schema_1.admin)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.admin.user_id, schema_1.user.id));
            return rows.map((r) => ({
                id: r.id,
                user_id: r.user_id,
                address: r.address,
                phone_no: r.phone_no,
                birth_date: r.birth_date,
                can_approve: r.can_approve,
                created_at: r.created_at,
                updated_at: r.updated_at,
                full_name: r.full_name,
                email: r.email,
                role_id: r.role_id
            }));
        });
    },
    getAdminById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [row] = yield drizzle_1.db.select({
                id: schema_1.admin.id,
                user_id: schema_1.admin.user_id,
                address: schema_1.admin.address,
                phone_no: schema_1.admin.phone_no,
                birth_date: schema_1.admin.birth_date,
                can_approve: schema_1.admin.can_approve,
                created_at: schema_1.admin.created_at,
                updated_at: schema_1.admin.updated_at,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role_id: schema_1.user.role_id
            })
                .from(schema_1.admin)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.admin.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.eq)(schema_1.admin.id, id));
            if (!row)
                return null;
            return {
                id: row.id,
                user_id: row.user_id,
                address: row.address,
                phone_no: row.phone_no,
                birth_date: row.birth_date,
                can_approve: row.can_approve,
                created_at: row.created_at,
                updated_at: row.updated_at,
                full_name: row.full_name,
                email: row.email,
                role_id: row.role_id
            };
        });
    },
    createAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, data.user_id) });
            if (!existingUser) {
                throw new error_1.NotFoundError(`User dengan ID ${data.user_id}`);
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
                can_approve: (_a = data.can_approve) !== null && _a !== void 0 ? _a : false,
            });
            const [admin] = yield drizzle_1.db.select({
                id: schema_1.admin.id,
                user_id: schema_1.admin.user_id,
                address: schema_1.admin.address,
                phone_no: schema_1.admin.phone_no,
                birth_date: schema_1.admin.birth_date,
                can_approve: schema_1.admin.can_approve,
                created_at: schema_1.admin.created_at,
                updated_at: schema_1.admin.updated_at,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role_id: schema_1.user.role_id
            })
                .from(schema_1.admin)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.admin.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.eq)(schema_1.admin.user_id, data.user_id));
            if (!admin) {
                throw new Error('Gagal membuat admin');
            }
            return {
                id: admin.id,
                user_id: admin.user_id,
                address: admin.address,
                phone_no: admin.phone_no,
                birth_date: admin.birth_date,
                can_approve: admin.can_approve,
                created_at: admin.created_at,
                updated_at: admin.updated_at,
                full_name: admin.full_name,
                email: admin.email,
                role_id: admin.role_id
            };
        });
    },
    updateAdmin(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, id) });
            if (!existingAdmin) {
                throw new error_1.NotFoundError(`Admin dengan ID ${id}`);
            }
            const adminUpdateData = {};
            if (data.address !== undefined)
                adminUpdateData.address = data.address;
            if (data.phone_no !== undefined)
                adminUpdateData.phone_no = data.phone_no;
            if (data.birth_date !== undefined)
                adminUpdateData.birth_date = new Date(data.birth_date);
            if (data.can_approve !== undefined)
                adminUpdateData.can_approve = data.can_approve;
            const userUpdateData = {};
            if (data.full_name !== undefined)
                userUpdateData.full_name = data.full_name;
            if (data.email !== undefined) {
                const emailExists = yield drizzle_1.db.query.user.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.user.email, data.email), (0, drizzle_orm_1.ne)(schema_1.user.id, existingAdmin.user_id))
                });
                if (emailExists) {
                    throw new error_1.DuplicateEntryError('Email', data.email);
                }
                userUpdateData.email = data.email;
            }
            if (Object.keys(adminUpdateData).length > 0) {
                yield drizzle_1.db.update(schema_1.admin).set(adminUpdateData).where((0, drizzle_orm_1.eq)(schema_1.admin.id, id));
            }
            if (Object.keys(userUpdateData).length > 0) {
                yield drizzle_1.db.update(schema_1.user).set(userUpdateData).where((0, drizzle_orm_1.eq)(schema_1.user.id, existingAdmin.user_id));
            }
            const [updatedAdmin] = yield drizzle_1.db.select({
                id: schema_1.admin.id,
                user_id: schema_1.admin.user_id,
                address: schema_1.admin.address,
                phone_no: schema_1.admin.phone_no,
                birth_date: schema_1.admin.birth_date,
                can_approve: schema_1.admin.can_approve,
                created_at: schema_1.admin.created_at,
                updated_at: schema_1.admin.updated_at,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role_id: schema_1.user.role_id
            })
                .from(schema_1.admin)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.admin.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.eq)(schema_1.admin.id, id));
            return {
                id: updatedAdmin.id,
                user_id: updatedAdmin.user_id,
                address: updatedAdmin.address,
                phone_no: updatedAdmin.phone_no,
                birth_date: updatedAdmin.birth_date,
                can_approve: updatedAdmin.can_approve,
                created_at: updatedAdmin.created_at,
                updated_at: updatedAdmin.updated_at,
                full_name: updatedAdmin.full_name,
                email: updatedAdmin.email,
                role_id: updatedAdmin.role_id
            };
        });
    },
    deleteAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, id) });
            if (!existingAdmin) {
                throw new error_1.NotFoundError(`Admin dengan ID ${id}`);
            }
            yield drizzle_1.db.delete(schema_1.admin).where((0, drizzle_orm_1.eq)(schema_1.admin.id, id));
            return { id, message: 'Admin berhasil dihapus' };
        });
    },
    updateAdminByUserId(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, userId) });
            if (!existingAdmin) {
                throw new error_1.NotFoundError(`Admin dengan User ID ${userId}`);
            }
            const adminUpdateData = {};
            if (data.address !== undefined)
                adminUpdateData.address = data.address;
            if (data.phone_no !== undefined)
                adminUpdateData.phone_no = data.phone_no;
            if (data.birth_date !== undefined)
                adminUpdateData.birth_date = new Date(data.birth_date);
            if (data.can_approve !== undefined)
                adminUpdateData.can_approve = data.can_approve;
            const userUpdateData = {};
            if (data.full_name !== undefined)
                userUpdateData.full_name = data.full_name;
            if (data.email !== undefined) {
                const emailExists = yield drizzle_1.db.query.user.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.user.email, data.email), (0, drizzle_orm_1.ne)(schema_1.user.id, userId))
                });
                if (emailExists) {
                    throw new error_1.DuplicateEntryError('Email', data.email);
                }
                userUpdateData.email = data.email;
            }
            if (data.password !== undefined) {
                userUpdateData.password = yield bcryptjs_1.default.hash(data.password, 10);
            }
            if (Object.keys(adminUpdateData).length > 0) {
                yield drizzle_1.db.update(schema_1.admin).set(adminUpdateData).where((0, drizzle_orm_1.eq)(schema_1.admin.user_id, userId));
            }
            if (Object.keys(userUpdateData).length > 0) {
                yield drizzle_1.db.update(schema_1.user).set(userUpdateData).where((0, drizzle_orm_1.eq)(schema_1.user.id, userId));
            }
            const [updatedAdmin] = yield drizzle_1.db.select({
                id: schema_1.admin.id,
                user_id: schema_1.admin.user_id,
                address: schema_1.admin.address,
                phone_no: schema_1.admin.phone_no,
                birth_date: schema_1.admin.birth_date,
                can_approve: schema_1.admin.can_approve,
                created_at: schema_1.admin.created_at,
                updated_at: schema_1.admin.updated_at,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role_id: schema_1.user.role_id
            })
                .from(schema_1.admin)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.admin.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.eq)(schema_1.admin.user_id, userId));
            return {
                id: updatedAdmin.id,
                user_id: updatedAdmin.user_id,
                address: updatedAdmin.address,
                phone_no: updatedAdmin.phone_no,
                birth_date: updatedAdmin.birth_date,
                can_approve: updatedAdmin.can_approve,
                created_at: updatedAdmin.created_at,
                updated_at: updatedAdmin.updated_at,
                full_name: updatedAdmin.full_name,
                email: updatedAdmin.email,
                role_id: updatedAdmin.role_id
            };
        });
    },
};
