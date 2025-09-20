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
exports.AssesseeService = void 0;
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const translateGenderToEn = (gender) => {
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'laki-laki':
            return 'male';
        case 'perempuan':
            return 'female';
        default:
            throw new Error(`Gender ${gender} tidak diketahui`);
    }
};
const translateGenderToId = (gender) => {
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'male':
            return 'LAKI-LAKI';
        case 'female':
            return 'PEREMPUAN';
        default:
            throw new Error(`Gender ${gender} tidak diketahui`);
    }
};
class AssesseeService {
    static getAssessees() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            var _a, _b;
            const offset = (page - 1) * limit;
            const assessees = yield drizzle_1.db.select({
                id: schema_1.assessee.id,
                user_id: schema_1.assessee.user_id,
                name: schema_1.user.full_name,
                identity_number: schema_1.assessee.identity_number,
                birth_date: schema_1.assessee.birth_date,
                birth_location: schema_1.assessee.birth_location,
                gender: schema_1.assessee.gender,
                nationality: schema_1.assessee.nationality,
                phone_no: schema_1.assessee.phone_no,
                house_phone_no: schema_1.assessee.house_phone_no,
                office_phone_no: schema_1.assessee.office_phone_no,
                address: schema_1.assessee.address,
                postal_code: schema_1.assessee.postal_code,
                educational_qualifications: schema_1.assessee.educational_qualifications,
                job: schema_1.assesseeJob
            }).from(schema_1.assessee)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .innerJoin(schema_1.assesseeJob, (0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, schema_1.assessee.id))
                .limit(limit).offset(offset);
            const countRows = yield drizzle_1.db.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` }).from(schema_1.assessee);
            const total = Number((_b = (_a = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0);
            const totalPages = Math.max(1, Math.ceil(total / limit));
            return { data: assessees.map(this.formatAssesseeResponse), meta: { current_page: page, limit, total, total_pages: totalPages } };
        });
    }
    static getAssesseeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.select({
                id: schema_1.assessee.id,
                user_id: schema_1.assessee.user_id,
                name: schema_1.user.full_name,
                identity_number: schema_1.assessee.identity_number,
                birth_date: schema_1.assessee.birth_date,
                birth_location: schema_1.assessee.birth_location,
                gender: schema_1.assessee.gender,
                nationality: schema_1.assessee.nationality,
                phone_no: schema_1.assessee.phone_no,
                house_phone_no: schema_1.assessee.house_phone_no,
                office_phone_no: schema_1.assessee.office_phone_no,
                address: schema_1.assessee.address,
                postal_code: schema_1.assessee.postal_code,
                educational_qualifications: schema_1.assessee.educational_qualifications,
                job: schema_1.assesseeJob
            }).from(schema_1.assessee)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .innerJoin(schema_1.assesseeJob, (0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, schema_1.assessee.id))
                .where((0, drizzle_orm_1.eq)(schema_1.assessee.id, id));
            if (assessee.length === 0)
                throw new error_1.NotFoundError('Assessee');
            const [assesseeData] = assessee;
            return this.formatAssesseeResponse(assesseeData);
        });
    }
    static createAssessee(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const existing = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, data.user_id) });
            if (existing)
                throw new error_1.DuplicateEntryError('Assessee untuk user_id', data.user_id.toString());
            yield drizzle_1.db.insert(schema_1.assessee).values({
                user_id: data.user_id,
                identity_number: data.identity_number,
                birth_date: new Date(data.birth_date),
                birth_location: data.birth_location,
                gender: translateGenderToEn(data.gender),
                nationality: data.nationality,
                phone_no: data.phone_no,
                house_phone_no: (_a = data.house_phone_no) !== null && _a !== void 0 ? _a : null,
                office_phone_no: (_b = data.office_phone_no) !== null && _b !== void 0 ? _b : null,
                address: data.address,
                postal_code: (_c = data.postal_code) !== null && _c !== void 0 ? _c : null,
                educational_qualifications: data.educational_qualifications,
            });
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, data.user_id) });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            return this.formatAssesseeResponse(assessee);
        });
    }
    static updateAssessee(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const existing = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, id) });
            if (!existing)
                throw new error_1.NotFoundError('Assessee');
            yield drizzle_1.db.update(schema_1.assessee).set({
                user_id: data.user_id,
                identity_number: data.identity_number,
                birth_date: new Date(data.birth_date),
                birth_location: data.birth_location,
                gender: translateGenderToEn(data.gender),
                nationality: data.nationality,
                phone_no: data.phone_no,
                house_phone_no: (_a = data.house_phone_no) !== null && _a !== void 0 ? _a : null,
                office_phone_no: (_b = data.office_phone_no) !== null && _b !== void 0 ? _b : null,
                address: data.address,
                postal_code: (_c = data.postal_code) !== null && _c !== void 0 ? _c : null,
                educational_qualifications: data.educational_qualifications,
            }).where((0, drizzle_orm_1.eq)(schema_1.assessee.id, id));
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, id) });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            return this.formatAssesseeResponse(assessee);
        });
    }
    static deleteAssessee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, id) });
            if (!existing)
                throw new error_1.NotFoundError('Assessee');
            yield drizzle_1.db.delete(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.id, id));
        });
    }
    static formatAssesseeResponse(assessee) {
        return {
            id: assessee.id,
            user_id: assessee.user_id,
            name: assessee.user.full_name,
            identity_number: assessee.identity_number,
            birth_date: assessee.birth_date,
            birth_location: assessee.birth_location,
            gender: assessee.gender,
            nationality: assessee.nationality,
            phone_no: assessee.phone_no,
            house_phone_no: assessee.house_phone_no,
            office_phone_no: assessee.office_phone_no,
            address: assessee.address,
            postal_code: assessee.postal_code,
            educational_qualifications: assessee.educational_qualifications,
            job: assessee.job
        };
    }
}
exports.AssesseeService = AssesseeService;
