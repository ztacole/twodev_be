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
exports.AssessorService = void 0;
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AssessorService {
    static getAssessors() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessors = yield drizzle_1.db.select().from(schema_1.assessor);
            const userIds = assessors.map(a => a.user_id);
            const schemeIds = assessors.map(a => a.scheme_id);
            const users = userIds.length ? yield drizzle_1.db.select().from(schema_1.user) : [];
            const roles = yield drizzle_1.db.select().from(schema_1.role);
            const schemes = schemeIds.length ? yield drizzle_1.db.select().from(schema_1.scheme) : [];
            const roleById = new Map(roles.map(r => [r.id, r]));
            const userById = new Map(users.map(u => [u.id, u]));
            const schemeById = new Map(schemes.map(s => [s.id, s]));
            return assessors.map(a => {
                var _a;
                return this.formatAssessorResponse(Object.assign(Object.assign({}, a), { user: Object.assign(Object.assign({}, userById.get(a.user_id)), { role: roleById.get((_a = userById.get(a.user_id)) === null || _a === void 0 ? void 0 : _a.role_id) }), scheme: schemeById.get(a.scheme_id) }));
            });
        });
    }
    static getAssessorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const a = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!a)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, a.user_id) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.role_id) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, a.scheme_id) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, a), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static getAssessorByUserId(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const a = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, user_id) });
            if (!a)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, a.user_id) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.role_id) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, a.scheme_id) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, a), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static createAssessor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, data.user_id) });
            if (existing) {
                throw new error_1.DuplicateEntryError('Assessor untuk user_id', data.user_id.toString());
            }
            yield drizzle_1.db.insert(schema_1.assessor).values({
                user_id: data.user_id,
                scheme_id: data.scheme_id,
                no_reg_met: data.no_reg_met,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date),
            });
            const created = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.assessor.user_id, data.user_id), (0, drizzle_orm_1.eq)(schema_1.assessor.scheme_id, data.scheme_id)) });
            if (!created)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, created.user_id) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.role_id) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, created.scheme_id) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, created), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
        });
    }
    static updateAssessor(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Assessor');
            }
            yield drizzle_1.db.update(schema_1.assessor)
                .set({
                user_id: data.user_id,
                scheme_id: data.scheme_id,
                no_reg_met: data.no_reg_met,
                address: data.address,
                phone_no: data.phone_no,
                birth_date: new Date(data.birth_date),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.assessor.id, id));
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!assessor)
                throw new error_1.NotFoundError('Assessor');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
            const role = user ? yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.id, user.role_id) }) : null;
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, assessor.scheme_id) });
            return this.formatAssessorResponse(Object.assign(Object.assign({}, assessor), { user: Object.assign(Object.assign({}, user), { role }), scheme }));
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
            const fileData = {};
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
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, assessorId) });
            if (!assessor)
                throw new error_1.NotFoundError('Assessor');
            const existingDetail = yield drizzle_1.db.query.assessorDetail.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessorId)
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
                yield drizzle_1.db.update(schema_1.assessorDetail)
                    .set(detailData)
                    .where((0, drizzle_orm_1.eq)(schema_1.assessorDetail.id, existingDetail.id));
                const updated = yield drizzle_1.db.query.assessorDetail.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.id, existingDetail.id)
                });
                return updated;
            }
            else {
                yield drizzle_1.db.insert(schema_1.assessorDetail).values(detailData);
                const newDetail = yield drizzle_1.db.query.assessorDetail.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.assessorDetail.assessor_id, assessorId)
                });
                return newDetail;
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
    static formatAssessorResponse(assessor) {
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
exports.AssessorService = AssessorService;
