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
exports.AssesseeService = void 0;
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const exceljs_1 = __importDefault(require("exceljs"));
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
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, keyword, occupation_id, year) {
            var _a, _b;
            const offset = (page - 1) * limit;
            const conditions = [];
            if (keyword) {
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.user.full_name, `%${keyword}%`), (0, drizzle_orm_1.like)(schema_1.user.email, `%${keyword}%`), (0, drizzle_orm_1.like)(schema_1.assessee.identity_number, `%${keyword}%`), (0, drizzle_orm_1.like)(schema_1.assessee.phone_no, `%${keyword}%`)));
            }
            if (occupation_id) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.occupation.id, occupation_id));
            }
            if (year) {
                conditions.push((0, drizzle_orm_1.sql) `YEAR(${schema_1.assessee.created_at}) = ${year}`);
            }
            const query = drizzle_1.db.selectDistinct({
                id: schema_1.assessee.id,
                user_id: schema_1.assessee.user_id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
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
                signature: schema_1.assessee.signature,
                job: schema_1.assesseeJob
            }).from(schema_1.assessee)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .leftJoin(schema_1.assesseeJob, (0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, schema_1.assessee.id))
                .leftJoin(schema_1.result, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .leftJoin(schema_1.assessmentSchedule, (0, drizzle_orm_1.eq)(schema_1.result.schedule_id, schema_1.assessmentSchedule.id))
                .leftJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, schema_1.assessment.id))
                .leftJoin(schema_1.occupation, (0, drizzle_orm_1.eq)(schema_1.assessment.occupation_id, schema_1.occupation.id));
            if (conditions.length > 0) {
                query.where((0, drizzle_orm_1.and)(...conditions));
            }
            query.orderBy((0, drizzle_orm_1.sql) `${schema_1.assessee.id} ASC`);
            const assessees = yield query.limit(limit).offset(offset);
            // Count query
            const countQuery = drizzle_1.db.select({ count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.assessee.id})` })
                .from(schema_1.assessee)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .leftJoin(schema_1.result, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .leftJoin(schema_1.assessmentSchedule, (0, drizzle_orm_1.eq)(schema_1.result.schedule_id, schema_1.assessmentSchedule.id))
                .leftJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, schema_1.assessment.id))
                .leftJoin(schema_1.occupation, (0, drizzle_orm_1.eq)(schema_1.assessment.occupation_id, schema_1.occupation.id));
            if (conditions.length > 0) {
                countQuery.where((0, drizzle_orm_1.and)(...conditions));
            }
            const countRows = yield countQuery;
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
                email: schema_1.user.email,
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
                signature: schema_1.assessee.signature,
                job: schema_1.assesseeJob
            }).from(schema_1.assessee)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .leftJoin(schema_1.assesseeJob, (0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, schema_1.assessee.id))
                .where((0, drizzle_orm_1.eq)(schema_1.assessee.id, id));
            if (assessee.length === 0)
                throw new error_1.NotFoundError('Assessee');
            // If you expect multiple jobs, you might want to aggregate them
            const assesseeData = Object.assign(Object.assign({}, assessee[0]), { jobs: assessee.map(row => row.job).filter(job => job !== null) });
            return this.formatAssesseeResponse(assesseeData);
        });
    }
    static createAssessee(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                signature: (_d = data.signature) !== null && _d !== void 0 ? _d : null,
            });
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, data.user_id) });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            return this.formatAssesseeResponse(assessee);
        });
    }
    static updateAssessee(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                signature: (_d = data.signature) !== null && _d !== void 0 ? _d : null,
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
            name: assessee.name,
            email: assessee.email,
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
            signature: assessee.signature,
            job: assessee.job
        };
    }
    static exportAssesseesToExcel(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const conditions = [];
            if (filters.occupation_id) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.occupation.id, filters.occupation_id));
            }
            if (filters.scheme_id) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.scheme.id, filters.scheme_id));
            }
            if (filters.schedule_id) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, filters.schedule_id));
            }
            if (filters.is_competent !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.result.is_competent, filters.is_competent));
            }
            if (filters.year) {
                conditions.push((0, drizzle_orm_1.sql) `YEAR(${schema_1.assessee.created_at}) = ${filters.year}`);
            }
            const query = drizzle_1.db.select({
                id: schema_1.assessee.id,
                name: schema_1.user.full_name,
                email: schema_1.user.email,
                identity_number: schema_1.assessee.identity_number,
                birth_date: schema_1.assessee.birth_date,
                birth_location: schema_1.assessee.birth_location,
                gender: schema_1.assessee.gender,
                phone_no: schema_1.assessee.phone_no,
                address: schema_1.assessee.address,
                postal_code: schema_1.assessee.postal_code,
                educational_qualifications: schema_1.assessee.educational_qualifications,
                institution_name: schema_1.assesseeJob.institution_name,
                occupation_name: schema_1.occupation.name,
                scheme_name: schema_1.scheme.name,
                is_competent: schema_1.result.is_competent,
            })
                .from(schema_1.assessee)
                .leftJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .leftJoin(schema_1.assesseeJob, (0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, schema_1.assessee.id))
                .leftJoin(schema_1.result, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .leftJoin(schema_1.assessmentSchedule, (0, drizzle_orm_1.eq)(schema_1.result.schedule_id, schema_1.assessmentSchedule.id))
                .leftJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, schema_1.assessment.id))
                .leftJoin(schema_1.occupation, (0, drizzle_orm_1.eq)(schema_1.assessment.occupation_id, schema_1.occupation.id))
                .leftJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, schema_1.scheme.id));
            if (conditions.length > 0) {
                query.where((0, drizzle_orm_1.and)(...conditions));
            }
            query.orderBy((0, drizzle_orm_1.sql) `${schema_1.assessee.id} ASC`);
            const assessees = yield query;
            if (!assessees.length) {
                throw new error_1.NotFoundError('Data asesi tidak ditemukan untuk kriteria ini');
            }
            // Excel
            const workbook = new exceljs_1.default.Workbook();
            const worksheet = workbook.addWorksheet('Rekap Data Asesi');
            // Header
            const headers = [
                'No',
                'Nama Lengkap',
                'No. Identitas (NIK/NISN)',
                'Tempat Lahir',
                'Tanggal Lahir',
                'Jenis Kelamin',
                'No. HP / WhatsApp',
                'Email',
                'Pendidikan',
                'Asal Sekolah / Instansi',
                'Alamat',
                'Skema',
                'Okupasi',
                'Status Kompetensi'
            ];
            const headerRow = worksheet.addRow(headers);
            // Styling Header
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE77D35' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
            headerRow.height = 28;
            assessees.forEach((row, index) => {
                var _a, _b;
                // Format tanggal lahir
                let formattedBirthDate = '-';
                if (row.birth_date) {
                    const d = new Date(row.birth_date);
                    if (!isNaN(d.getTime())) {
                        formattedBirthDate = d.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        });
                    }
                }
                // Format gender
                const genderDisplay = ((_a = row.gender) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'male' || ((_b = row.gender) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'laki-laki'
                    ? 'Laki-Laki'
                    : 'Perempuan';
                // Format status kompetensi
                let statusKompetensi = 'Belum Ujian';
                if (row.is_competent === true)
                    statusKompetensi = 'Kompeten';
                else if (row.is_competent === false)
                    statusKompetensi = 'Belum Kompeten';
                const dataRow = worksheet.addRow([
                    index + 1,
                    row.name || '-',
                    row.identity_number || '-',
                    row.birth_location || '-',
                    formattedBirthDate,
                    genderDisplay,
                    row.phone_no || '-',
                    row.email || '-',
                    row.educational_qualifications || '-',
                    row.institution_name || '-',
                    row.address || '-',
                    row.scheme_name || '-',
                    row.occupation_name || '-',
                    statusKompetensi
                ]);
                // Border & Alignment baris data
                dataRow.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    if (colNumber === 1 || colNumber === 5 || colNumber === 6 || colNumber === 14) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                    else {
                        cell.alignment = { vertical: 'middle' };
                    }
                });
                dataRow.height = 22;
            });
            // Lebar tiap kolom
            worksheet.columns = [
                { width: 6 }, // No
                { width: 28 }, // Nama
                { width: 24 }, // NIK
                { width: 18 }, // Tempat Lahir
                { width: 20 }, // Tgl Lahir
                { width: 15 }, // Gender
                { width: 20 }, // No HP
                { width: 28 }, // Email
                { width: 20 }, // Pendidikan
                { width: 26 }, // Asal Instansi
                { width: 35 }, // Alamat
                { width: 25 }, // Skema
                { width: 28 }, // Okupasi
                { width: 20 }, // Status Kompetensi
            ];
            return yield workbook.xlsx.writeBuffer();
        });
    }
}
exports.AssesseeService = AssesseeService;
