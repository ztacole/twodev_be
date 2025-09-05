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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_1 = require("./drizzle");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding (Drizzle) start');
        // Basic cleanup
        yield drizzle_1.db.delete(schema_1.assessment);
        yield drizzle_1.db.delete(schema_1.occupation);
        yield drizzle_1.db.delete(schema_1.scheme);
        yield drizzle_1.db.delete(schema_1.admin);
        yield drizzle_1.db.delete(schema_1.assessor);
        yield drizzle_1.db.delete(schema_1.assessee);
        yield drizzle_1.db.delete(schema_1.user);
        yield drizzle_1.db.delete(schema_1.role);
        // Roles
        yield drizzle_1.db.insert(schema_1.role).values([
            { name: 'Admin' },
            { name: 'Assessor' },
            { name: 'Assessee' },
        ]);
        const adminRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Admin') });
        const assessorRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessor') });
        const assesseeRole = yield drizzle_1.db.query.role.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.role.name, 'Assessee') });
        const password = yield bcryptjs_1.default.hash('password', 10);
        // Users
        yield drizzle_1.db.insert(schema_1.user).values({ fullName: 'Admin Utama', email: 'admin@example.com', password, roleId: adminRole.id });
        yield drizzle_1.db.insert(schema_1.user).values({ fullName: 'Assessor Satu', email: 'assessor@example.com', password, roleId: assessorRole.id });
        yield drizzle_1.db.insert(schema_1.user).values({ fullName: 'Asesi Satu', email: 'asesi@example.com', password, roleId: assesseeRole.id });
        const adminUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'admin@example.com') });
        const assessorUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'assessor@example.com') });
        const assesseeUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.email, 'asesi@example.com') });
        // Profiles
        yield drizzle_1.db.insert(schema_1.admin).values({ userId: adminUser.id, address: 'Jl. Admin 1', phoneNo: '0811111111', birthDate: new Date('1980-01-01') });
        yield drizzle_1.db.insert(schema_1.assessor).values({ userId: assessorUser.id, schemeId: 0, noRegMet: 'MET.000.12345.2025', address: 'Jl. Assessor 1', phoneNo: '0822222222', birthDate: new Date('1985-01-01') });
        yield drizzle_1.db.insert(schema_1.assessee).values({ userId: assesseeUser.id, identityNumber: 'ID-001', birthDate: new Date('1990-01-01'), birthLocation: 'Jakarta', gender: 'male', nationality: 'Indonesia', phoneNo: '0833333333', address: 'Jl. Asesi 1', educationalQualifications: 'S1' });
        // Scheme/Occupation/Assessment
        yield drizzle_1.db.insert(schema_1.scheme).values({ code: 'RPL', name: 'Rekayasa Perangkat Lunak' });
        const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, 'RPL') });
        yield drizzle_1.db.insert(schema_1.occupation).values({ schemeId: scheme.id, name: 'Pengembang Web' });
        const occup = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.name, 'Pengembang Web') });
        yield drizzle_1.db.insert(schema_1.assessment).values({ occupationId: occup.id, code: 'SKM.RPL/2025' });
        console.log('Seeding (Drizzle) done');
    });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
