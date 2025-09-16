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
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_1 = require("../config/drizzle");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password';
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.hash(password, SALT_ROUNDS);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        console.log('Starting Drizzle seed...');
        // WARNING: this will wipe data. Adjust order if your DB has FK constraints different from this script.
        console.log('Deleting old data (in safe order)...');
        try {
            // delete children first - adapt table names if different in your drizzle/schema
            yield drizzle_1.db.delete(schema_1.resultDoc);
            yield drizzle_1.db.delete(schema_1.result);
            yield drizzle_1.db.delete(schema_1.scheduleDetail);
            yield drizzle_1.db.delete(schema_1.assessmentSchedule);
            // headers & other result sub-tables
            yield drizzle_1.db.delete(schema_1.resultApl02Header);
            yield drizzle_1.db.delete(schema_1.resultIa01Header);
            yield drizzle_1.db.delete(schema_1.resultIa02Header);
            yield drizzle_1.db.delete(schema_1.resultIa03Header);
            yield drizzle_1.db.delete(schema_1.resultIa05Header);
            yield drizzle_1.db.delete(schema_1.resultIa07Header);
            yield drizzle_1.db.delete(schema_1.resultAk01Header);
            yield drizzle_1.db.delete(schema_1.resultAk02Header);
            // assessment related
            yield drizzle_1.db.delete(schema_1.ia07Question);
            yield drizzle_1.db.delete(schema_1.questionOption);
            yield drizzle_1.db.delete(schema_1.ia05Question);
            yield drizzle_1.db.delete(schema_1.ucApl02);
            yield drizzle_1.db.delete(schema_1.groupIa03);
            yield drizzle_1.db.delete(schema_1.groupIa02);
            yield drizzle_1.db.delete(schema_1.groupIa01);
            yield drizzle_1.db.delete(schema_1.assessment);
            // occupations schemes
            yield drizzle_1.db.delete(schema_1.occupation);
            yield drizzle_1.db.delete(schema_1.scheme);
            // assessee / assessor
            yield drizzle_1.db.delete(schema_1.assesseeJob);
            yield drizzle_1.db.delete(schema_1.assessee);
            yield drizzle_1.db.delete(schema_1.assessorDetail);
            yield drizzle_1.db.delete(schema_1.assessor);
            yield drizzle_1.db.delete(schema_1.admin);
            yield drizzle_1.db.delete(schema_1.user);
            yield drizzle_1.db.delete(schema_1.role);
        }
        catch (e) {
            console.warn('Warning while deleting: ', e);
        }
        // 1) Roles
        console.log('Creating roles...');
        yield drizzle_1.db.insert(schema_1.role).values({ name: 'Admin' });
        yield drizzle_1.db.insert(schema_1.role).values({ name: 'Assessor' });
        yield drizzle_1.db.insert(schema_1.role).values({ name: 'Assessee' });
        const adminRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Admin') });
        const assessorRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessor') });
        const assesseeRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessee') });
        // 2) Users + password
        console.log('Creating users...');
        const hashedPassword = yield hashPassword(DEFAULT_PASSWORD);
        // Admin user
        yield drizzle_1.db.insert(schema_1.user).values({ full_name: 'Admin Utama', email: 'admin@example.com', password: hashedPassword, role_id: (adminRole === null || adminRole === void 0 ? void 0 : adminRole.id) || 1 });
        const adminUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'admin@example.com') });
        if (adminUser) {
            yield drizzle_1.db.insert(schema_1.admin).values({ user_id: adminUser.id, address: 'Jalan Admin No. 123', phone_no: '081234567890', birth_date: new Date('1980-01-01') });
        }
        // Schemes
        console.log('Creating schemes and occupations...');
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'RPL', name: 'Rekayasa Perangkat Lunak' });
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'PH', name: 'Perhotelan' });
        const schemeRPL = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'RPL') });
        const schemePH = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'PH') });
        // Occupations
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_a = schemeRPL === null || schemeRPL === void 0 ? void 0 : schemeRPL.id) !== null && _a !== void 0 ? _a : 1), name: 'Pengembang Web' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_b = schemeRPL === null || schemeRPL === void 0 ? void 0 : schemeRPL.id) !== null && _b !== void 0 ? _b : 1), name: 'Pengembang Mobile' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_c = schemePH === null || schemePH === void 0 ? void 0 : schemePH.id) !== null && _c !== void 0 ? _c : 1), name: 'Pelayanan Hotel' });
        const occupation1 = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.name, 'Pengembang Web') });
        // Assessor users
        console.log('Creating assessors...');
        yield drizzle_1.db.insert(schema_1.user).values({ full_name: 'Assessor Pertama', email: 'assessor1@example.com', password: hashedPassword, role_id: (assessorRole === null || assessorRole === void 0 ? void 0 : assessorRole.id) || 2 });
        const assessorUser1 = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'assessor1@example.com') });
        if (assessorUser1) {
            yield drizzle_1.db.insert(schema_1.assessor).values({ user_id: assessorUser1.id, address: 'Jalan Assessor No. 456', phone_no: '082345678901', birth_date: new Date('1985-05-15'), no_reg_met: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`, scheme_id: ((_d = schemeRPL === null || schemeRPL === void 0 ? void 0 : schemeRPL.id) !== null && _d !== void 0 ? _d : 1) });
            const assessorRow = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, assessorUser1.id) });
            if (assessorRow) {
                yield drizzle_1.db.insert(schema_1.assessorDetail).values({ assessor_id: assessorRow.id, tax_id_number: '123456789012345', bank_book_cover: 'buku_bank_1.jpg', certificate: 'sertifikat_1.pdf', national_id: 'ktp_1.jpg' });
            }
        }
        // Assessees
        console.log('Creating assessees...');
        yield drizzle_1.db.insert(schema_1.user).values({ full_name: 'Asesi Pertama', email: 'asesi1@example.com', password: hashedPassword, role_id: (assesseeRole === null || assesseeRole === void 0 ? void 0 : assesseeRole.id) || 3 });
        const assesseeUser1 = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'asesi1@example.com') });
        if (assesseeUser1) {
            yield drizzle_1.db.insert(schema_1.assessee).values({ user_id: assesseeUser1.id, identity_number: '1234567890', birth_date: new Date('1990-03-10'), birth_location: 'Jakarta', gender: 'male', nationality: 'Indonesia', phone_no: '084567890123', address: 'Jalan Asesi No. 101', educational_qualifications: 'Sarjana' });
            const assesseeRow = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, assesseeUser1.id) });
            if (assesseeRow) {
                yield drizzle_1.db.insert(schema_1.assesseeJob).values({ assessee_id: assesseeRow.id, institution_name: 'Perusahaan Teknologi Inc.', address: 'Gedung Perkantoran Tower 200', postal_code: '12345', position: 'Pengembang Software', phone_no: '0211234567', job_email: 'asesi1@perusahaan.com' });
            }
        }
        // Create assessment minimal + groups/units/elements/details + ia05/ia07
        console.log('Creating assessment + groups + questions...');
        yield drizzle_1.db.insert(schema_1.assessment).values({ occupation_id: ((_e = occupation1 === null || occupation1 === void 0 ? void 0 : occupation1.id) !== null && _e !== void 0 ? _e : 1), code: 'SKM.RPL/2025' });
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.code, 'SKM.RPL/2025') });
        if (assessment) {
            // groups_ia01
            yield drizzle_1.db.insert(schema_1.groupIa01).values({ assessment_id: assessment.id, name: 'Pengembangan Web Dasar' });
            const g1 = yield drizzle_1.db.query.groupIa01.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa01.assessment_id, assessment.id) });
            if (g1) {
                // create unit, element, details
                const unitsTableName = 'units';
                // Some schemas name nested tables differently; try generic insert via SQL if needed.
                // IA05 question
                yield drizzle_1.db.insert(schema_1.ia05Question).values({ assessment_id: assessment.id, order: 1, question: 'Apa kepanjangan dari CSS?' });
                const ia05q = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment.id) });
                if (ia05q) {
                    yield drizzle_1.db.insert(schema_1.questionOption).values({ question_id: ia05q.id, option: 'Cascading Style Sheets', is_answer: true });
                    yield drizzle_1.db.insert(schema_1.questionOption).values({ question_id: ia05q.id, option: 'Computer Style Sheets', is_answer: false });
                }
                // IA07 question
                yield drizzle_1.db.insert(schema_1.ia07Question).values({ assessment_id: assessment.id, question: 'Jelaskan apa yang dimaksud dengan Box Model dalam CSS dan sebutkan komponen-komponennya!', answer_key: 'Box Model = content,padding,border,margin' });
            }
            // UC APL02
            const ucApl02Data = {
                unit_code: "I.55HDR00.037.13",
                title: "Melakukan Reservasi Tamu",
                elements: [
                    {
                        title: "Menerima Permintaan Reservasi Tamu",
                        code: "E.55HDR00.037.13.1",
                        details: [
                            { description: "Mampu mencatat detail reservasi dengan lengkap" },
                            { description: "Mampu memverifikasi ketersediaan kamar" }
                        ]
                    },
                    {
                        title: "Memproses Reservasi Tamu",
                        code: "E.55HDR00.037.13.2",
                        details: [
                            { description: "Mampu menjelaskan metode pembayaran yang tersedia" },
                            { description: "Mampu memproses pembayaran sesuai prosedur" }
                        ]
                    },
                    {
                        title: "Memberikan Konfirmasi",
                        code: "E.55HDR00.037.13.3",
                        details: [
                            { description: "Mampu mengirimkan konfirmasi reservasi" },
                            { description: "Mampu memberikan informasi tambahan yang diperlukan" }
                        ]
                    }
                ]
            };
            // Insert UC APL02
            yield drizzle_1.db.insert(schema_1.ucApl02).values({
                assessment_id: assessment.id,
                unit_code: ucApl02Data.unit_code,
                title: ucApl02Data.title
            });
            const ucApl02Row = yield drizzle_1.db.query.ucApl02.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.unit_code, ucApl02Data.unit_code)
            });
            if (ucApl02Row) {
                for (const elem of ucApl02Data.elements) {
                    yield drizzle_1.db.insert(schema_1.elementApl02).values({
                        uc_id: ucApl02Row.id,
                        title: elem.title,
                    });
                    const elemRow = yield drizzle_1.db.query.elementApl02.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.elementApl02.title, elem.title) && (0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, ucApl02Row.id)
                    });
                    if (elemRow) {
                        for (const det of elem.details) {
                            yield drizzle_1.db.insert(schema_1.elementDetailsApl02).values({
                                element_id: elemRow.id,
                                description: det.description
                            });
                        }
                    }
                }
            }
        }
        // schedule
        console.log('Creating schedule...');
        if (assessment) {
            yield drizzle_1.db.insert(schema_1.assessmentSchedule).values({ assessment_id: assessment.id, start_date: new Date('2023-12-01'), end_date: new Date('2023-12-05') });
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, assessment.id) });
            if (schedule && assessorUser1) {
                const assessorRow = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, assessorUser1.id) });
                if (assessorRow) {
                    yield drizzle_1.db.insert(schema_1.scheduleDetail).values({ schedule_id: schedule.id, assessor_id: assessorRow.id, location: 'Gedung LSP Teknologi Lt. 3' });
                }
            }
        }
        // create a simple result + docs + headers
        console.log('Creating a sample result + docs + headers...');
        if (assessment && assessorUser1 && assesseeUser1) {
            const assessorRow = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, assessorUser1.id) });
            const assesseeRow = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, assesseeUser1.id) });
            if (assessorRow && assesseeRow) {
                yield drizzle_1.db.insert(schema_1.result).values({ assessment_id: assessment.id, assessor_id: assessorRow.id, assessee_id: assesseeRow.id, is_competent: false, tuk: 'sewaktu' });
                const resultRow = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment.id) });
                if (resultRow) {
                    yield drizzle_1.db.insert(schema_1.resultDoc).values({ result_id: resultRow.id, purpose: 'Sertifikasi Profesi', school_report_card: 'ijazah.pdf', field_work_practice_certificate: 'sertifikat_pkl.pdf', student_card: 'kartu_mahasiswa.pdf', family_card: 'kartu_keluarga.pdf', id_card: 'ktp.pdf', approved: true });
                    // headers
                    yield drizzle_1.db.insert(schema_1.resultApl02Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false, is_continue: false });
                    yield drizzle_1.db.insert(schema_1.resultIa01Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false, is_competent: false });
                    yield drizzle_1.db.insert(schema_1.resultIa02Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false });
                    yield drizzle_1.db.insert(schema_1.resultIa03Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false });
                    yield drizzle_1.db.insert(schema_1.resultIa05Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false, is_achieved: false });
                    yield drizzle_1.db.insert(schema_1.resultIa07Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false });
                    yield drizzle_1.db.insert(schema_1.resultAk01Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false });
                    yield drizzle_1.db.insert(schema_1.resultAk02Header).values({ result_id: resultRow.id, approved_assessee: false, approved_assessor: false, is_competent: false });
                    yield drizzle_1.db.insert(schema_1.resultAk03Header).values({ result_id: resultRow.id });
                    yield drizzle_1.db.insert(schema_1.resultAk04).values({ result_id: resultRow.id, approved_assessee: false, q1_yes: false, q2_yes: false, q3_yes: false, reason: "" });
                    yield drizzle_1.db.insert(schema_1.resultAk05).values({ result_id: resultRow.id, approved_assessor: false, is_competent: false });
                }
            }
        }
        console.log('Drizzle seeding finished.');
    });
}
main().catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
}).finally(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // close drizzle connection if needed
    try {
        yield ((_b = (_a = drizzle_1.db).end) === null || _b === void 0 ? void 0 : _b.call(_a));
    }
    catch (e) { }
    process.exit(0);
}));
