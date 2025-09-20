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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
        // Schemes
        console.log('Creating schemes and occupations...');
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'RPL', name: 'Rekayasa Perangkat Lunak' });
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'ULP', name: 'Usaha Layanan Pariwisata' });
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'TBS', name: 'Tata Busana' });
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'PH', name: 'Perhotelan' });
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'TBG', name: 'Tata Boga' });
        const schemeRPL = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'RPL') });
        const schemeULP = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'ULP') });
        const schemeTBS = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'TBS') });
        const schemePH = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'PH') });
        const schemeTBG = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'TBG') });
        // Occupations
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_a = schemeRPL === null || schemeRPL === void 0 ? void 0 : schemeRPL.id) !== null && _a !== void 0 ? _a : 1), name: 'Junior Programming' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_b = schemeULP === null || schemeULP === void 0 ? void 0 : schemeULP.id) !== null && _b !== void 0 ? _b : 1), name: 'Junior Ticketing Officer' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_c = schemeULP === null || schemeULP === void 0 ? void 0 : schemeULP.id) !== null && _c !== void 0 ? _c : 1), name: 'Booker' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_d = schemeTBS === null || schemeTBS === void 0 ? void 0 : schemeTBS.id) !== null && _d !== void 0 ? _d : 1), name: 'Junior Custom Made' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_e = schemePH === null || schemePH === void 0 ? void 0 : schemePH.id) !== null && _e !== void 0 ? _e : 1), name: 'Guest Service Agent' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_f = schemePH === null || schemePH === void 0 ? void 0 : schemePH.id) !== null && _f !== void 0 ? _f : 1), name: 'Trainee Waiter' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_g = schemePH === null || schemePH === void 0 ? void 0 : schemePH.id) !== null && _g !== void 0 ? _g : 1), name: 'Bartender' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_h = schemeTBG === null || schemeTBG === void 0 ? void 0 : schemeTBG.id) !== null && _h !== void 0 ? _h : 1), name: 'Butcher Commis' });
        yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: ((_j = schemeTBG === null || schemeTBG === void 0 ? void 0 : schemeTBG.id) !== null && _j !== void 0 ? _j : 1), name: 'Assistant Junior' });
        // Roles
        console.log('Creating roles...');
        yield drizzle_1.db.insert(schema_1.role).values({ name: 'Admin' });
        yield drizzle_1.db.insert(schema_1.role).values({ name: 'Assessor' });
        yield drizzle_1.db.insert(schema_1.role).values({ name: 'Assessee' });
        const adminRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Admin') });
        const assessorRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessor') });
        const assesseeRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessee') });
        // Users + password
        console.log('Creating users...');
        const hashedPassword = yield hashPassword(DEFAULT_PASSWORD);
        // Admin user
        yield drizzle_1.db.insert(schema_1.user).values({ full_name: 'Admin Utama', email: 'admin@example.com', password: hashedPassword, role_id: (adminRole === null || adminRole === void 0 ? void 0 : adminRole.id) || 1 });
        const adminUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'admin@example.com') });
        if (adminUser) {
            yield drizzle_1.db.insert(schema_1.admin).values({ user_id: adminUser.id, address: 'Jalan Admin No. 123', phone_no: '081234567890', birth_date: new Date('1980-01-01') });
        }
        // Assessor users
        console.log('Creating assessors...');
        yield drizzle_1.db.insert(schema_1.user).values({ full_name: 'Assessor Pertama', email: 'assessor1@example.com', password: hashedPassword, role_id: (assessorRole === null || assessorRole === void 0 ? void 0 : assessorRole.id) || 2 });
        const assessorUser1 = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'assessor1@example.com') });
        if (assessorUser1) {
            yield drizzle_1.db.insert(schema_1.assessor).values({ user_id: assessorUser1.id, address: 'Jalan Assessor No. 456', phone_no: '082345678901', birth_location: 'Bandung', institution: 'LSP Media Informatika', birth_date: new Date('1985-05-15'), no_reg_met: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`, scheme_id: ((_k = schemeRPL === null || schemeRPL === void 0 ? void 0 : schemeRPL.id) !== null && _k !== void 0 ? _k : 1) });
            const assessorRow = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, assessorUser1.id) });
            if (assessorRow) {
                yield drizzle_1.db.insert(schema_1.assessorDetail).values({ assessor_id: assessorRow.id, tax_id_number: '123456789012345.jpg', bank_book_cover: 'buku_bank_1.jpg', certificate: 'sertifikat_1.pdf', id_card: 'id_card_1.jpg', national_id: 'ktp_1.jpg' });
            }
        }
        // Assessees
        console.log('Creating assessees...');
        yield drizzle_1.db.insert(schema_1.user).values({ full_name: 'Asesi Pertama', email: 'asesi1@example.com', password: hashedPassword, role_id: (assesseeRole === null || assesseeRole === void 0 ? void 0 : assesseeRole.id) || 3 });
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
