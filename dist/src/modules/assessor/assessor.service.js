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
exports.AssessorService = void 0;
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const promises_1 = require("fs/promises");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AssessorService {
    static getAssessors() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, keyword) {
            var _a, _b;
            const offset = (page - 1) * limit;
            const assessors = yield drizzle_1.db.select({
                id: schema_1.assessor.id,
                user_id: schema_1.assessor.user_id,
                scheme_id: schema_1.assessor.scheme_id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
                birth_location: schema_1.assessor.birth_location,
                birth_date: schema_1.assessor.birth_date,
                no_reg_met: schema_1.assessor.no_reg_met,
                institution: schema_1.assessor.institution,
                address: schema_1.assessor.address,
                phone_no: schema_1.assessor.phone_no,
                scheme: schema_1.scheme,
                detail: schema_1.assessorDetail
            })
                .from(schema_1.assessor)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id))
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.assessor.scheme_id, schema_1.scheme.id))
                .innerJoin(schema_1.assessorDetail, (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.or)(keyword ? (0, drizzle_orm_1.like)(schema_1.user.full_name, `%${keyword}%`) : undefined, keyword ? (0, drizzle_orm_1.like)(schema_1.user.email, `%${keyword}%`) : undefined))
                .limit(limit)
                .offset(offset);
            const countRows = yield drizzle_1.db.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` }).from(schema_1.assessor);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0);
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const data = assessors.map(a => this.formatAssessorResponse(a));
            return { data, meta: { current_page: page, limit, total, total_pages: totalPages } };
        });
    }
    static getAllAssessors(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessors = yield drizzle_1.db.select({
                id: schema_1.assessor.id,
                user_id: schema_1.assessor.user_id,
                scheme_id: schema_1.assessor.scheme_id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
                birth_location: schema_1.assessor.birth_location,
                birth_date: schema_1.assessor.birth_date,
                no_reg_met: schema_1.assessor.no_reg_met,
                institution: schema_1.assessor.institution,
                address: schema_1.assessor.address,
                phone_no: schema_1.assessor.phone_no,
                scheme: schema_1.scheme,
                detail: schema_1.assessorDetail
            })
                .from(schema_1.assessor)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id))
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.assessor.scheme_id, schema_1.scheme.id))
                .innerJoin(schema_1.assessorDetail, (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.or)(keyword ? (0, drizzle_orm_1.like)(schema_1.user.full_name, `%${keyword}%`) : undefined, keyword ? (0, drizzle_orm_1.like)(schema_1.user.email, `%${keyword}%`) : undefined));
            const data = assessors.map(a => this.formatAssessorResponse(a));
            return { data };
        });
    }
    static getAssessorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [assessor] = yield drizzle_1.db.select({
                id: schema_1.assessor.id,
                user_id: schema_1.assessor.user_id,
                scheme_id: schema_1.assessor.scheme_id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
                birth_location: schema_1.assessor.birth_location,
                birth_date: schema_1.assessor.birth_date,
                no_reg_met: schema_1.assessor.no_reg_met,
                institution: schema_1.assessor.institution,
                address: schema_1.assessor.address,
                phone_no: schema_1.assessor.phone_no,
                scheme: schema_1.scheme,
                detail: schema_1.assessorDetail
            })
                .from(schema_1.assessor)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id))
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.assessor.scheme_id, schema_1.scheme.id))
                .innerJoin(schema_1.assessorDetail, (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.eq)(schema_1.assessor.id, id));
            if (!assessor)
                throw new error_1.NotFoundError('Assessor');
            return this.formatAssessorResponse(assessor);
        });
    }
    static getAssessorByUserId(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [assessor] = yield drizzle_1.db.select({
                id: schema_1.assessor.id,
                user_id: schema_1.assessor.user_id,
                scheme_id: schema_1.assessor.scheme_id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
                birth_location: schema_1.assessor.birth_location,
                birth_date: schema_1.assessor.birth_date,
                no_reg_met: schema_1.assessor.no_reg_met,
                institution: schema_1.assessor.institution,
                address: schema_1.assessor.address,
                phone_no: schema_1.assessor.phone_no,
                scheme: schema_1.scheme,
                detail: schema_1.assessorDetail
            })
                .from(schema_1.assessor)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id))
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.assessor.scheme_id, schema_1.scheme.id))
                .innerJoin(schema_1.assessorDetail, (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.eq)(schema_1.assessor.user_id, user_id));
            if (!assessor)
                throw new error_1.NotFoundError('Assessor');
            return this.formatAssessorResponse(assessor);
        });
    }
    static createAssessor(data, files) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, data.user_id) });
            if (!user || user.role_id !== 2) {
                for (const file of files) {
                    const oldPath = path_1.default.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                    if (fs_1.default.existsSync(oldPath)) {
                        fs_1.default.unlinkSync(oldPath);
                    }
                }
                throw user ? new Error('User bukan assessor') : new error_1.NotFoundError('User');
            }
            let assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, data.user_id) });
            if (assessor) {
                yield drizzle_1.db.update(schema_1.assessor).set({
                    scheme_id: data.scheme_id,
                    no_reg_met: data.no_reg_met,
                    address: data.address,
                    phone_no: data.phone_no,
                    birth_date: new Date(data.birth_date)
                });
            }
            else {
                const [id] = yield drizzle_1.db.insert(schema_1.assessor).values({
                    user_id: data.user_id,
                    scheme_id: data.scheme_id,
                    no_reg_met: data.no_reg_met,
                    institution: data.institution,
                    address: data.address,
                    phone_no: data.phone_no,
                    birth_location: data.birth_location,
                    birth_date: new Date(data.birth_date),
                }).$returningId();
                assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, Number(id.id)) });
            }
            if (!assessor)
                throw new error_1.NotFoundError('Assessor');
            if (data.name && data.email) {
                try {
                    const userEmailAssessor = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, data.email) });
                    if (!userEmailAssessor) {
                        yield drizzle_1.db.update(schema_1.user).set({
                            full_name: data.name,
                            email: data.email
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id));
                    }
                    else if (userEmailAssessor.id !== assessor.user_id) {
                        yield drizzle_1.db.update(schema_1.user).set({
                            full_name: data.name,
                            email: data.email
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id));
                    }
                    else if (userEmailAssessor.id === assessor.user_id) {
                        yield drizzle_1.db.update(schema_1.user).set({
                            full_name: data.name
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id));
                    }
                }
                catch (error) {
                    for (const file of files) {
                        const oldPath = path_1.default.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                        if (fs_1.default.existsSync(oldPath)) {
                            fs_1.default.unlinkSync(oldPath);
                        }
                    }
                    throw error;
                }
            }
            // Pindahkan file dari folder default ke folder final setelah id diketahui
            const newDir = path_1.default.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessor.id}`);
            if (fs_1.default.existsSync(newDir)) {
                for (const fileName of fs_1.default.readdirSync(newDir)) {
                    const filePath = path_1.default.join(newDir, fileName);
                    try {
                        fs_1.default.unlinkSync(filePath);
                    }
                    catch (_a) { }
                }
            }
            for (const file of files) {
                const oldPath = path_1.default.join(__dirname, '../../../public/uploads/assessor/default', file.filename);
                const newPath = path_1.default.join(newDir, file.filename);
                if (!fs_1.default.existsSync(newDir)) {
                    fs_1.default.mkdirSync(newDir, { recursive: true });
                }
                if (fs_1.default.existsSync(oldPath)) {
                    fs_1.default.renameSync(oldPath, newPath);
                }
            }
            try {
                yield this.createOrUpdateAssessorDetail({
                    assessorId: assessor.id,
                    bodyData: data,
                    files
                });
                console.log('Assessor detail created/updated successfully');
            }
            catch (error) {
                yield drizzle_1.db.delete(schema_1.assessor).where((0, drizzle_orm_1.eq)(schema_1.assessor.id, assessor.id));
                console.log('Error creating/updating assessor detail:', error.message);
                throw new Error(error.message);
            }
            console.log('Assessor created/updated successfully');
            const [assessorResponse] = yield drizzle_1.db.select({
                id: schema_1.assessor.id,
                user_id: schema_1.assessor.user_id,
                scheme_id: schema_1.assessor.scheme_id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
                birth_location: schema_1.assessor.birth_location,
                birth_date: schema_1.assessor.birth_date,
                no_reg_met: schema_1.assessor.no_reg_met,
                institution: schema_1.assessor.institution,
                address: schema_1.assessor.address,
                phone_no: schema_1.assessor.phone_no,
                scheme: schema_1.scheme,
                detail: schema_1.assessorDetail
            })
                .from(schema_1.assessor)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id))
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.assessor.scheme_id, schema_1.scheme.id))
                .innerJoin(schema_1.assessorDetail, (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.eq)(schema_1.assessor.id, assessor.id));
            return this.formatAssessorResponse(assessorResponse);
        });
    }
    static deleteAssessor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Assessor');
            }
            yield drizzle_1.db.delete(schema_1.assessor).where((0, drizzle_orm_1.eq)(schema_1.assessor.id, id));
        });
    }
    static createOrUpdateAssessorDetail(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assessorId, bodyData, files } = params;
            const BASE_URL = "https://asessment24.site";
            const UPLOAD_DIR = path_1.default.join(__dirname, `../../../../public/uploads/assessor/assessor-${assessorId}`);
            const requiredFields = ['tax_id_number', 'bank_book_cover', 'certificate', 'id_card', 'national_id'];
            const fileData = {};
            try {
                const fileArray = Array.isArray(files) ? files : [];
                if (fileArray.length < 5) {
                    throw new error_1.ValidationError('File belum lengkap.');
                }
                for (const file of fileArray) {
                    if (requiredFields.includes(file.fieldname)) {
                        // File sudah dipindahkan ke folder final
                        fileData[file.fieldname] = `${BASE_URL}/twodev/uploads/assessor/assessor-${assessorId}/${file.filename}`;
                    }
                }
                for (const key of Object.keys(bodyData || {})) {
                    if (requiredFields.includes(key) && bodyData[key]) {
                        fileData[key] = bodyData[key];
                    }
                }
                for (const field of requiredFields) {
                    if (!fileData[field] && !bodyData[field]) {
                        throw new error_1.ValidationError(`Field ${field} harus diisi`);
                    }
                }
                const existingAssessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, assessorId) });
                if (!existingAssessor) {
                    throw new error_1.NotFoundError('Assessor');
                }
                const existingDetail = yield drizzle_1.db.query.assessorDetail.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessorId)
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
                    yield drizzle_1.db.update(schema_1.assessorDetail)
                        .set(detailData)
                        .where((0, drizzle_orm_1.eq)(schema_1.assessorDetail.id, existingDetail.id));
                    const updated = yield drizzle_1.db.query.assessorDetail.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.id, existingDetail.id)
                    });
                    return updated;
                }
                else {
                    const [inserted] = yield drizzle_1.db.insert(schema_1.assessorDetail).values(detailData).$returningId();
                    const created = yield drizzle_1.db.query.assessorDetail.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.id, inserted.id)
                    });
                    return created;
                }
            }
            catch (error) {
                yield drizzle_1.db.delete(schema_1.assessorDetail).where((0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessorId));
                try {
                    yield (0, promises_1.rm)(UPLOAD_DIR, { recursive: true, force: true });
                }
                catch (error) {
                    console.log(error);
                }
                throw new Error(error.message);
            }
        });
    }
    static getAssessorDetail(assessorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = yield drizzle_1.db.query.assessorDetail.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessorId)
            });
            if (!detail)
                throw new error_1.NotFoundError('Assessor Detail');
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, assessorId) });
            const user = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            return Object.assign(Object.assign({}, detail), { assessor: assessor ? Object.assign(Object.assign({}, assessor), { user: user }) : null });
        });
    }
    static getAllAssessorDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const details = yield drizzle_1.db.select()
                .from(schema_1.assessorDetail)
                .innerJoin(schema_1.assessor, (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, schema_1.assessor.id))
                .innerJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id));
            return details.map(row => (Object.assign(Object.assign({}, row.assessor_detail), { assessor: Object.assign(Object.assign({}, row.assessor), { user: row.user }) })));
        });
    }
    static getAssessorUsers() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, keyword) {
            var _a, _b;
            const offset = (page - 1) * limit;
            const users = yield drizzle_1.db.select({
                id: schema_1.user.id,
                full_name: schema_1.user.full_name,
                email: schema_1.user.email,
                role: schema_1.role.name,
                has_assessor_data: schema_1.assessor.id
            })
                .from(schema_1.user)
                .innerJoin(schema_1.role, (0, drizzle_orm_1.eq)(schema_1.user.role_id, schema_1.role.id))
                .leftJoin(schema_1.assessor, (0, drizzle_orm_1.eq)(schema_1.user.id, schema_1.assessor.user_id))
                .leftJoin(schema_1.assessorDetail, (0, drizzle_orm_1.eq)(schema_1.assessor.id, schema_1.assessorDetail.assessor_id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessor'), (0, drizzle_orm_1.or)(keyword ? (0, drizzle_orm_1.like)(schema_1.user.full_name, `%${keyword}%`) : undefined, keyword ? (0, drizzle_orm_1.like)(schema_1.user.email, `%${keyword}%`) : undefined)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.user.full_name), (0, drizzle_orm_1.asc)(schema_1.user.created_at))
                .limit(limit)
                .offset(offset);
            const results = users.map(u => ({
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                role: u.role,
                status: u.has_assessor_data ? 'Lengkap' : 'Belum Lengkap'
            }));
            const allUsers = yield drizzle_1.db.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
                .from(schema_1.user)
                .innerJoin(schema_1.role, (0, drizzle_orm_1.eq)(schema_1.user.role_id, schema_1.role.id))
                .leftJoin(schema_1.assessor, (0, drizzle_orm_1.eq)(schema_1.user.id, schema_1.assessor.user_id))
                .where((0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessor'));
            const total = Number((_b = (_a = allUsers === null || allUsers === void 0 ? void 0 : allUsers[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0);
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const meta = {
                current_page: page,
                limit,
                total,
                total_pages: totalPages
            };
            return { data: results, meta };
        });
    }
    static formatAssessorResponse(assessor) {
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
exports.AssessorService = AssessorService;
