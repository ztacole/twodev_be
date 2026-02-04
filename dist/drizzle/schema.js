"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultIa05Header = exports.questionOption = exports.ia05Question = exports.resultIa03 = exports.resultIa03Header = exports.ia03Question = exports.resultIa02Header = exports.resultIa01 = exports.resultIa01Header = exports.ucIa03 = exports.groupIa03 = exports.ia02Pdf = exports.ia02Tool = exports.ucIa02 = exports.groupIa02 = exports.elementDetailsIa = exports.elementIa = exports.ucIa01 = exports.groupIa01 = exports.resultAk05 = exports.resultAk04 = exports.resultAk03 = exports.resultAk03Header = exports.ak02Evidence = exports.resultAk02 = exports.resultAk02Header = exports.resultAk01 = exports.resultAk01Header = exports.apl02Evidence = exports.resultApl02 = exports.resultApl02Header = exports.elementDetailsApl02 = exports.elementApl02 = exports.ucApl02 = exports.resultDoc = exports.result = exports.scheduleDetail = exports.assessmentSchedule = exports.assessment = exports.assesseeJob = exports.assessee = exports.assessorDetail = exports.assessor = exports.occupation = exports.scheme = exports.admin = exports.user = exports.role = exports.tukEnum = exports.genderEnum = void 0;
exports.assessmentReport = exports.approvalRequest = exports.resultIa07 = exports.resultIa07Header = exports.ia07Question = exports.resultIa05 = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// ========= Enums =========
exports.genderEnum = (0, mysql_core_1.mysqlEnum)('gender', ['male', 'female']);
exports.tukEnum = (0, mysql_core_1.mysqlEnum)('tuk', ['sewaktu', 'tempat_kerja', 'mandiri']);
const timestamps = {
    created_at: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
};
// ========= Core RBAC & Users =========
exports.role = (0, mysql_core_1.mysqlTable)('role', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.user = (0, mysql_core_1.mysqlTable)('user', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), full_name: (0, mysql_core_1.varchar)('full_name', { length: 255 }).notNull(), email: (0, mysql_core_1.varchar)('email', { length: 255 }).notNull().unique(), password: (0, mysql_core_1.varchar)('password', { length: 255 }).notNull(), role_id: (0, mysql_core_1.int)('role_id').notNull().references(() => exports.role.id, { onUpdate: 'cascade', onDelete: 'cascade' }) }, timestamps));
exports.admin = (0, mysql_core_1.mysqlTable)('admin', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), user_id: (0, mysql_core_1.int)('user_id').notNull().unique().references(() => exports.user.id, { onUpdate: 'cascade', onDelete: 'cascade' }), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), birth_date: (0, mysql_core_1.date)('birth_date').notNull(), can_approve: (0, mysql_core_1.boolean)('can_approve').notNull().default(false), signature: (0, mysql_core_1.varchar)('signature', { length: 255 }) }, timestamps));
// ========= Master Data (Schemes, Occupations) =========
exports.scheme = (0, mysql_core_1.mysqlTable)('scheme', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), code: (0, mysql_core_1.varchar)('code', { length: 255 }).notNull(), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.occupation = (0, mysql_core_1.mysqlTable)('occupation', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), scheme_id: (0, mysql_core_1.int)('scheme_id').notNull().references(() => exports.scheme.id, { onUpdate: 'cascade', onDelete: 'cascade' }), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.assessor = (0, mysql_core_1.mysqlTable)('assessor', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), user_id: (0, mysql_core_1.int)('user_id').notNull().unique().references(() => exports.user.id, { onUpdate: 'cascade', onDelete: 'cascade' }), scheme_id: (0, mysql_core_1.int)('scheme_id').notNull().references(() => exports.scheme.id, { onUpdate: 'cascade', onDelete: 'cascade' }), no_reg_met: (0, mysql_core_1.varchar)('no_reg_met', { length: 255 }).notNull(), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), birth_location: (0, mysql_core_1.varchar)('birth_location', { length: 255 }).notNull(), institution: (0, mysql_core_1.varchar)('institution', { length: 255 }).notNull(), birth_date: (0, mysql_core_1.date)('birth_date').notNull(), signature: (0, mysql_core_1.varchar)('signature', { length: 255 }) }, timestamps));
exports.assessorDetail = (0, mysql_core_1.mysqlTable)('assessor_detail', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessor_id: (0, mysql_core_1.int)('assessor_id').notNull().unique().references(() => exports.assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }), tax_id_number: (0, mysql_core_1.varchar)('tax_id_number', { length: 255 }).notNull(), bank_book_cover: (0, mysql_core_1.varchar)('bank_book_cover', { length: 255 }).notNull(), certificate: (0, mysql_core_1.varchar)('certificate', { length: 255 }).notNull(), id_card: (0, mysql_core_1.varchar)('id_card', { length: 255 }).notNull(), national_id: (0, mysql_core_1.varchar)('national_id', { length: 255 }).notNull() }, timestamps));
exports.assessee = (0, mysql_core_1.mysqlTable)('assessee', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), user_id: (0, mysql_core_1.int)('user_id').notNull().references(() => exports.user.id, { onUpdate: 'cascade', onDelete: 'cascade' }), identity_number: (0, mysql_core_1.varchar)('identity_number', { length: 255 }).notNull(), birth_date: (0, mysql_core_1.date)('birth_date').notNull(), birth_location: (0, mysql_core_1.varchar)('birth_location', { length: 255 }).notNull(), gender: exports.genderEnum.notNull(), nationality: (0, mysql_core_1.varchar)('nationality', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), house_phone_no: (0, mysql_core_1.varchar)('house_phone_no', { length: 255 }), office_phone_no: (0, mysql_core_1.varchar)('office_phone_no', { length: 255 }), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), postal_code: (0, mysql_core_1.varchar)('postal_code', { length: 255 }), educational_qualifications: (0, mysql_core_1.varchar)('educational_qualifications', { length: 255 }).notNull(), signature: (0, mysql_core_1.varchar)('signature', { length: 255 }) }, timestamps));
exports.assesseeJob = (0, mysql_core_1.mysqlTable)('assessee_job', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessee_id: (0, mysql_core_1.int)('assessee_id').notNull().unique().references(() => exports.assessee.id, { onUpdate: 'cascade', onDelete: 'cascade' }), institution_name: (0, mysql_core_1.varchar)('institution_name', { length: 255 }).notNull(), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), postal_code: (0, mysql_core_1.varchar)('postal_code', { length: 255 }).notNull(), position: (0, mysql_core_1.varchar)('position', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), job_email: (0, mysql_core_1.varchar)('job_email', { length: 255 }).notNull() }, timestamps));
exports.assessment = (0, mysql_core_1.mysqlTable)('assessment', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), occupation_id: (0, mysql_core_1.int)('occupation_id').notNull().references(() => exports.occupation.id, { onUpdate: 'cascade', onDelete: 'cascade' }), code: (0, mysql_core_1.varchar)('code', { length: 255 }).notNull() }, timestamps));
exports.assessmentSchedule = (0, mysql_core_1.mysqlTable)('assessment_schedule', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), start_date: (0, mysql_core_1.timestamp)('start_date').notNull().defaultNow(), end_date: (0, mysql_core_1.timestamp)('end_date').notNull().defaultNow() }, timestamps));
exports.scheduleDetail = (0, mysql_core_1.mysqlTable)('schedule_detail', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), schedule_id: (0, mysql_core_1.int)('schedule_id').notNull().references(() => exports.assessmentSchedule.id, { onUpdate: 'cascade', onDelete: 'cascade' }), assessor_id: (0, mysql_core_1.int)('assessor_id').notNull().references(() => exports.assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }), location: (0, mysql_core_1.varchar)('location', { length: 255 }).notNull() }, timestamps));
exports.result = (0, mysql_core_1.mysqlTable)('result', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), 
    // assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    assessor_id: (0, mysql_core_1.int)('assessor_id').notNull().references(() => exports.assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }), assessee_id: (0, mysql_core_1.int)('assessee_id').notNull().references(() => exports.assessee.id, { onUpdate: 'cascade', onDelete: 'cascade' }), schedule_id: (0, mysql_core_1.int)('schedule_id').notNull().references(() => exports.assessmentSchedule.id, { onUpdate: 'cascade', onDelete: 'cascade' }), score: (0, mysql_core_1.int)('score').default(-1), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull(), tuk: exports.tukEnum.notNull() }, timestamps));
exports.resultDoc = (0, mysql_core_1.mysqlTable)('result_doc', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), admin_id: (0, mysql_core_1.int)('admin_id'), result_id: (0, mysql_core_1.int)('result_id').notNull().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), purpose: (0, mysql_core_1.varchar)('purpose', { length: 255 }).notNull(), school_report_card: (0, mysql_core_1.varchar)('school_report_card', { length: 255 }).notNull(), field_work_practice_certificate: (0, mysql_core_1.varchar)('field_work_practice_certificate', { length: 255 }).notNull(), student_card: (0, mysql_core_1.varchar)('student_card', { length: 255 }).notNull(), family_card: (0, mysql_core_1.varchar)('family_card', { length: 255 }).notNull(), id_card: (0, mysql_core_1.varchar)('id_card', { length: 255 }).notNull(), approved: (0, mysql_core_1.boolean)('approved').notNull() }, timestamps));
exports.ucApl02 = (0, mysql_core_1.mysqlTable)('uc_apl02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), unit_code: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(), title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull() }, timestamps));
exports.elementApl02 = (0, mysql_core_1.mysqlTable)('element_apl02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), uc_id: (0, mysql_core_1.int)('uc_id').notNull().references(() => exports.ucApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull() }, timestamps));
exports.elementDetailsApl02 = (0, mysql_core_1.mysqlTable)('element_details_apl02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), element_id: (0, mysql_core_1.int)('element_id').notNull().references(() => exports.elementApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), description: (0, mysql_core_1.text)('description').notNull() }, timestamps));
exports.resultApl02Header = (0, mysql_core_1.mysqlTable)('result_apl02_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(), is_continue: (0, mysql_core_1.boolean)('is_continue').notNull() }, timestamps));
exports.resultApl02 = (0, mysql_core_1.mysqlTable)('result_apl02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_apl02_id: (0, mysql_core_1.int)('result_apl02_id').notNull().references(() => exports.resultApl02Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), element_id: (0, mysql_core_1.int)('element_id').notNull().references(() => exports.elementApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull() }, timestamps), (table) => ({
    uniqueResultElement: (0, mysql_core_1.unique)().on(table.result_apl02_id, table.element_id)
}));
exports.apl02Evidence = (0, mysql_core_1.mysqlTable)('apl02_evidence', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_apl02_id: (0, mysql_core_1.int)('result_apl02_id').notNull().references(() => exports.resultApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), evidence: (0, mysql_core_1.varchar)('evidence', { length: 255 }).notNull() }, timestamps));
exports.resultAk01Header = (0, mysql_core_1.mysqlTable)('result_ak01_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull() }, timestamps));
exports.resultAk01 = (0, mysql_core_1.mysqlTable)('result_ak01', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultAk01Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), evidence: (0, mysql_core_1.varchar)('evidence', { length: 255 }).notNull() }, timestamps));
exports.resultAk02Header = (0, mysql_core_1.mysqlTable)('result_ak02_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull(), follow_up: (0, mysql_core_1.text)('follow_up'), comment: (0, mysql_core_1.text)('comment') }, timestamps));
exports.resultAk02 = (0, mysql_core_1.mysqlTable)('result_ak02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultAk02Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), uc_id: (0, mysql_core_1.int)('uc_id').notNull().references(() => exports.ucApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }) }, timestamps));
exports.ak02Evidence = (0, mysql_core_1.mysqlTable)('ak02_evidence', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_ak02_id: (0, mysql_core_1.int)('result_ak02_id').notNull().references(() => exports.resultAk02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), evidence: (0, mysql_core_1.varchar)('evidence', { length: 255 }).notNull() }, timestamps));
exports.resultAk03Header = (0, mysql_core_1.mysqlTable)('result_ak03_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), comment: (0, mysql_core_1.varchar)('comment', { length: 255 }) }, timestamps));
exports.resultAk03 = (0, mysql_core_1.mysqlTable)('result_ak03', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultAk03Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), question: (0, mysql_core_1.varchar)('question', { length: 255 }).notNull(), answer: (0, mysql_core_1.boolean)('answer').notNull(), comment: (0, mysql_core_1.varchar)('comment', { length: 255 }) }, timestamps));
exports.resultAk04 = (0, mysql_core_1.mysqlTable)('result_ak04', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), q1_yes: (0, mysql_core_1.boolean)('q1_yes').notNull(), q2_yes: (0, mysql_core_1.boolean)('q2_yes').notNull(), q3_yes: (0, mysql_core_1.boolean)('q3_yes').notNull(), reason: (0, mysql_core_1.varchar)('reason', { length: 255 }).notNull() }, timestamps));
exports.resultAk05 = (0, mysql_core_1.mysqlTable)('result_ak05', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull(), description: (0, mysql_core_1.varchar)('description', { length: 255 }), negative_positive_aspects: (0, mysql_core_1.varchar)('negative_positive_aspects', { length: 255 }), rejection_notes: (0, mysql_core_1.varchar)('rejection_notes', { length: 255 }), improvement_suggestions: (0, mysql_core_1.varchar)('improvement_suggestions', { length: 255 }), notes: (0, mysql_core_1.varchar)('notes', { length: 255 }) }, timestamps));
exports.groupIa01 = (0, mysql_core_1.mysqlTable)('group_ia01', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.ucIa01 = (0, mysql_core_1.mysqlTable)('uc_ia01', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), group_id: (0, mysql_core_1.int)('group_id').notNull().references(() => exports.groupIa01.id, { onUpdate: 'cascade', onDelete: 'cascade' }), unit_code: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(), title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull() }, timestamps));
exports.elementIa = (0, mysql_core_1.mysqlTable)('element_ia', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), uc_id: (0, mysql_core_1.int)('uc_id').notNull().references(() => exports.ucIa01.id, { onUpdate: 'cascade', onDelete: 'cascade' }), title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull() }, timestamps));
exports.elementDetailsIa = (0, mysql_core_1.mysqlTable)('element_details_ia', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), element_id: (0, mysql_core_1.int)('element_id').notNull().references(() => exports.elementIa.id, { onUpdate: 'cascade', onDelete: 'cascade' }), description: (0, mysql_core_1.text)('description').notNull(), benchmark: (0, mysql_core_1.varchar)('benchmark', { length: 255 }).notNull() }, timestamps));
exports.groupIa02 = (0, mysql_core_1.mysqlTable)('group_ia02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(), scenario: (0, mysql_core_1.text)('scenario').notNull(), duration: (0, mysql_core_1.int)('duration').notNull() }, timestamps));
exports.ucIa02 = (0, mysql_core_1.mysqlTable)('uc_ia02', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), group_id: (0, mysql_core_1.int)('group_id').notNull().references(() => exports.groupIa02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), unit_code: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(), title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull() }, timestamps));
exports.ia02Tool = (0, mysql_core_1.mysqlTable)('ia02_tool', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), group_id: (0, mysql_core_1.int)('group_id').notNull().references(() => exports.groupIa02.id, { onUpdate: 'cascade', onDelete: 'cascade' }), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.ia02Pdf = (0, mysql_core_1.mysqlTable)('ia02_pdf', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().unique().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), file_name: (0, mysql_core_1.varchar)('file_name', { length: 255 }).notNull() }, timestamps));
exports.groupIa03 = (0, mysql_core_1.mysqlTable)('group_ia03', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.ucIa03 = (0, mysql_core_1.mysqlTable)('uc_ia03', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), group_id: (0, mysql_core_1.int)('group_id').notNull().references(() => exports.groupIa03.id, { onUpdate: 'cascade', onDelete: 'cascade' }), unit_code: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(), title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull() }, timestamps));
exports.resultIa01Header = (0, mysql_core_1.mysqlTable)('result_ia01_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull() }, timestamps));
exports.resultIa01 = (0, mysql_core_1.mysqlTable)('result_ia01', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultIa01Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), element_detail_id: (0, mysql_core_1.int)('element_detail_id').notNull().references(() => exports.elementDetailsIa.id, { onUpdate: 'cascade', onDelete: 'cascade' }), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull(), evaluation: (0, mysql_core_1.text)('evaluation').notNull() }, timestamps), (table) => ({
    uniqueHeaderElement: (0, mysql_core_1.unique)().on(table.header_id, table.element_detail_id)
}));
exports.resultIa02Header = (0, mysql_core_1.mysqlTable)('result_ia02_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull() }, timestamps));
exports.ia03Question = (0, mysql_core_1.mysqlTable)('ia03_question', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), group_id: (0, mysql_core_1.int)('group_id').notNull().references(() => exports.groupIa03.id, { onUpdate: 'cascade', onDelete: 'cascade' }), question: (0, mysql_core_1.varchar)('question', { length: 255 }).notNull() }, timestamps));
exports.resultIa03Header = (0, mysql_core_1.mysqlTable)('result_ia03_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull() }, timestamps));
exports.resultIa03 = (0, mysql_core_1.mysqlTable)('result_ia03', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultIa03Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), question_id: (0, mysql_core_1.int)('question_id').notNull().references(() => exports.ia03Question.id, { onUpdate: 'cascade', onDelete: 'cascade' }), answer: (0, mysql_core_1.varchar)('answer', { length: 255 }).notNull(), approved: (0, mysql_core_1.boolean)('approved').notNull() }, timestamps), (table) => ({
    uniqueHeaderQuestion: (0, mysql_core_1.unique)().on(table.header_id, table.question_id)
}));
exports.ia05Question = (0, mysql_core_1.mysqlTable)('ia05_question', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), order: (0, mysql_core_1.int)('order').notNull(), question: (0, mysql_core_1.varchar)('question', { length: 255 }).notNull() }, timestamps));
exports.questionOption = (0, mysql_core_1.mysqlTable)('question_option', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), question_id: (0, mysql_core_1.int)('question_id').notNull().references(() => exports.ia05Question.id, { onUpdate: 'cascade', onDelete: 'cascade' }), option: (0, mysql_core_1.text)('option').notNull(), is_answer: (0, mysql_core_1.boolean)('is_answer').notNull() }, timestamps));
exports.resultIa05Header = (0, mysql_core_1.mysqlTable)('result_ia05_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(), is_achieved: (0, mysql_core_1.boolean)('is_achieved').notNull(), unit: (0, mysql_core_1.varchar)('unit', { length: 255 }), element: (0, mysql_core_1.varchar)('element', { length: 255 }), kuk: (0, mysql_core_1.varchar)('kuk', { length: 255 }) }, timestamps));
exports.resultIa05 = (0, mysql_core_1.mysqlTable)('result_ia05', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultIa05Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), option_id: (0, mysql_core_1.int)('option_id').notNull().references(() => exports.questionOption.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved: (0, mysql_core_1.boolean)('approved').notNull() }, timestamps), (table) => ({
    uniqueHeaderOption: (0, mysql_core_1.unique)().on(table.header_id, table.option_id)
}));
exports.ia07Question = (0, mysql_core_1.mysqlTable)('ia07_question', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), question: (0, mysql_core_1.text)('question').notNull(), answer_key: (0, mysql_core_1.text)('answer_key').notNull() }, timestamps));
exports.resultIa07Header = (0, mysql_core_1.mysqlTable)('result_ia07_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull() }, timestamps));
exports.resultIa07 = (0, mysql_core_1.mysqlTable)('result_ia07', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), header_id: (0, mysql_core_1.int)('header_id').notNull().references(() => exports.resultIa07Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }), question_id: (0, mysql_core_1.int)('question_id').notNull().references(() => exports.ia07Question.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved: (0, mysql_core_1.boolean)('approved').notNull() }, timestamps));
exports.approvalRequest = (0, mysql_core_1.mysqlTable)('approval_request', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), requester_admin_id: (0, mysql_core_1.int)('requester_admin_id').notNull().references(() => exports.admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approver_admin_id: (0, mysql_core_1.int)('approver_admin_id').notNull().references(() => exports.admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }), backup_admin_id: (0, mysql_core_1.int)('backup_admin_id').references(() => exports.admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_by: (0, mysql_core_1.int)('approved_by').references(() => exports.admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }), target_table: (0, mysql_core_1.varchar)('target_table', { length: 255 }).notNull(), target_id: (0, mysql_core_1.int)('target_id').notNull(), target_name: (0, mysql_core_1.varchar)('target_name', { length: 255 }), action: (0, mysql_core_1.varchar)('action', { length: 50 }).notNull(), status: (0, mysql_core_1.varchar)('status', { length: 50 }).notNull().default('pending'), comment: (0, mysql_core_1.text)('comment'), approved_at: (0, mysql_core_1.datetime)('approved_at') }, timestamps));
exports.assessmentReport = (0, mysql_core_1.mysqlTable)('assessment_report', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), is_competent: (0, mysql_core_1.tinyint)('is_competent').notNull(), statement: (0, mysql_core_1.varchar)('statement', { length: 255 }) }, timestamps));
// // ========= Relations =========
// export const roleRelations = relations(role, ({ many }) => ({
//     users: many(user)
// }));
// export const userRelations = relations(user, ({ one, many }) => ({
//     role: one(role, {
//         fields: [user.role_id],
//         references: [role.id]
//     }),
//     assessees: many(assessee),
//     assessor: one(assessor),
//     admin: one(admin)
// }));
// // adminRelations moved below after approvalRequest table declaration
// export const schemeRelations = relations(scheme, ({ many }) => ({
//     occupations: many(occupation),
//     assessors: many(assessor)
// }));
// export const occupationRelations = relations(occupation, ({ one, many }) => ({
//     scheme: one(scheme, {
//         fields: [occupation.scheme_id],
//         references: [scheme.id]
//     }),
//     assessments: many(assessment)
// }));
// export const assessorRelations = relations(assessor, ({ one, many }) => ({
//     user: one(user, {
//         fields: [assessor.user_id],
//         references: [user.id]
//     }),
//     scheme: one(scheme, {
//         fields: [assessor.scheme_id],
//         references: [scheme.id]
//     }),
//     scheduleDetails: many(scheduleDetail),
//     details: one(assessorDetail),
//     results: many(result)
// }));
// export const assessorDetailRelations = relations(assessorDetail, ({ one }) => ({
//     assessor: one(assessor, {
//         fields: [assessorDetail.assessor_id],
//         references: [assessor.id]
//     })
// }));
// export const assesseeRelations = relations(assessee, ({ one, many }) => ({
//     user: one(user, {
//         fields: [assessee.user_id],
//         references: [user.id]
//     }),
//     jobs: many(assesseeJob),
//     results: many(result)
// }));
// export const assesseeJobRelations = relations(assesseeJob, ({ one }) => ({
//     assessee: one(assessee, {
//         fields: [assesseeJob.assessee_id],
//         references: [assessee.id]
//     })
// }));
// export const assessmentRelations = relations(assessment, ({ one, many }) => ({
//     occupation: one(occupation, {
//         fields: [assessment.occupation_id],
//         references: [occupation.id]
//     }),
//     assessmentSchedules: many(assessmentSchedule),
//     results: many(result),
//     groupsIa01: many(groupIa01),
//     groupsIa02: many(groupIa02),
//     ia02Pdf: one(ia02Pdf),
//     groupsIa03: many(groupIa03),
//     ucApl02s: many(ucApl02),
//     ia05Questions: many(ia05Question),
//     ia07Questions: many(ia07Question)
// }));
// export const assessmentScheduleRelations = relations(assessmentSchedule, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [assessmentSchedule.assessment_id],
//         references: [assessment.id]
//     }),
//     scheduleDetails: many(scheduleDetail)
// }));
// export const scheduleDetailRelations = relations(scheduleDetail, ({ one }) => ({
//     schedule: one(assessmentSchedule, {
//         fields: [scheduleDetail.schedule_id],
//         references: [assessmentSchedule.id]
//     }),
//     assessor: one(assessor, {
//         fields: [scheduleDetail.assessor_id],
//         references: [assessor.id]
//     })
// }));
// export const resultRelations = relations(result, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [result.assessment_id],
//         references: [assessment.id]
//     }),
//     assessor: one(assessor, {
//         fields: [result.assessor_id],
//         references: [assessor.id]
//     }),
//     assessee: one(assessee, {
//         fields: [result.assessee_id],
//         references: [assessee.id]
//     }),
//     docs: many(resultDoc),
//     apl02Header: one(resultApl02Header),
//     ak01Header: one(resultAk01Header),
//     ak02Header: one(resultAk02Header),
//     ak03Header: one(resultAk03Header),
//     ak04: one(resultAk04),
//     ak05: one(resultAk05),
//     ia01Header: one(resultIa01Header),
//     ia02Header: one(resultIa02Header),
//     ia03Header: one(resultIa03Header),
//     ia05Header: one(resultIa05Header),
//     ia07Header: one(resultIa07Header)
// }));
// export const resultDocRelations = relations(resultDoc, ({ one }) => ({
//     result: one(result, {
//         fields: [resultDoc.result_id],
//         references: [result.id]
//     })
// }));
// // APL02 Relations
// export const ucApl02Relations = relations(ucApl02, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [ucApl02.assessment_id],
//         references: [assessment.id]
//     }),
//     elements: many(elementApl02),
//     ak02Rows: many(resultAk02)
// }));
// export const elementApl02Relations = relations(elementApl02, ({ one, many }) => ({
//     uc: one(ucApl02, {
//         fields: [elementApl02.uc_id],
//         references: [ucApl02.id]
//     }),
//     details: many(elementDetailsApl02),
//     results: many(resultApl02)
// }));
// export const elementDetailsApl02Relations = relations(elementDetailsApl02, ({ one }) => ({
//     element: one(elementApl02, {
//         fields: [elementDetailsApl02.element_id],
//         references: [elementApl02.id]
//     })
// }));
// export const resultApl02HeaderRelations = relations(resultApl02Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultApl02Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultApl02)
// }));
// export const resultApl02Relations = relations(resultApl02, ({ one, many }) => ({
//     header: one(resultApl02Header, {
//         fields: [resultApl02.result_apl02_id],
//         references: [resultApl02Header.id]
//     }),
//     element: one(elementApl02, {
//         fields: [resultApl02.element_id],
//         references: [elementApl02.id]
//     }),
//     evidences: many(apl02Evidence)
// }));
// export const apl02EvidenceRelations = relations(apl02Evidence, ({ one }) => ({
//     row: one(resultApl02, {
//         fields: [apl02Evidence.result_apl02_id],
//         references: [resultApl02.id]
//     })
// }));
// // AK01-AK05 Relations
// export const resultAk01HeaderRelations = relations(resultAk01Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultAk01Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultAk01)
// }));
// export const resultAk01Relations = relations(resultAk01, ({ one }) => ({
//     header: one(resultAk01Header, {
//         fields: [resultAk01.header_id],
//         references: [resultAk01Header.id]
//     })
// }));
// export const resultAk02HeaderRelations = relations(resultAk02Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultAk02Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultAk02)
// }));
// export const resultAk02Relations = relations(resultAk02, ({ one, many }) => ({
//     header: one(resultAk02Header, {
//         fields: [resultAk02.header_id],
//         references: [resultAk02Header.id]
//     }),
//     uc: one(ucApl02, {
//         fields: [resultAk02.uc_id],
//         references: [ucApl02.id]
//     }),
//     evidences: many(ak02Evidence)
// }));
// export const ak02EvidenceRelations = relations(ak02Evidence, ({ one }) => ({
//     row: one(resultAk02, {
//         fields: [ak02Evidence.result_ak02_id],
//         references: [resultAk02.id]
//     })
// }));
// export const resultAk03HeaderRelations = relations(resultAk03Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultAk03Header.result_id],
//         references: [result.id]
//     }),
//     answers: many(resultAk03)
// }));
// export const resultAk03Relations = relations(resultAk03, ({ one }) => ({
//     header: one(resultAk03Header, {
//         fields: [resultAk03.header_id],
//         references: [resultAk03Header.id]
//     })
// }));
// export const resultAk04Relations = relations(resultAk04, ({ one }) => ({
//     result: one(result, {
//         fields: [resultAk04.result_id],
//         references: [result.id]
//     })
// }));
// export const resultAk05Relations = relations(resultAk05, ({ one }) => ({
//     result: one(result, {
//         fields: [resultAk05.result_id],
//         references: [result.id]
//     })
// }));
// // IA01-IA03 Structure Relations
// export const groupIa01Relations = relations(groupIa01, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [groupIa01.assessment_id],
//         references: [assessment.id]
//     }),
//     units: many(ucIa01)
// }));
// export const ucIa01Relations = relations(ucIa01, ({ one, many }) => ({
//     group: one(groupIa01, {
//         fields: [ucIa01.group_id],
//         references: [groupIa01.id]
//     }),
//     elements: many(elementIa)
// }));
// export const elementIaRelations = relations(elementIa, ({ one, many }) => ({
//     uc: one(ucIa01, {
//         fields: [elementIa.uc_id],
//         references: [ucIa01.id]
//     }),
//     details: many(elementDetailsIa)
// }));
// export const elementDetailsIaRelations = relations(elementDetailsIa, ({ one, many }) => ({
//     element: one(elementIa, {
//         fields: [elementDetailsIa.element_id],
//         references: [elementIa.id]
//     }),
//     results: many(resultIa01)
// }));
// export const groupIa02Relations = relations(groupIa02, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [groupIa02.assessment_id],
//         references: [assessment.id]
//     }),
//     tools: many(ia02Tool),
//     units: many(ucIa02)
// }));
// export const ucIa02Relations = relations(ucIa02, ({ one }) => ({
//     group: one(groupIa02, {
//         fields: [ucIa02.group_id],
//         references: [groupIa02.id]
//     })
// }));
// export const ia02ToolRelations = relations(ia02Tool, ({ one }) => ({
//     group: one(groupIa02, {
//         fields: [ia02Tool.group_id],
//         references: [groupIa02.id]
//     })
// }));
// export const ia02PdfRelations = relations(ia02Pdf, ({ one }) => ({
//     assessment: one(assessment, {
//         fields: [ia02Pdf.assessment_id],
//         references: [assessment.id]
//     })
// }));
// export const groupIa03Relations = relations(groupIa03, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [groupIa03.assessment_id],
//         references: [assessment.id]
//     }),
//     units: many(ucIa03),
//     questions: many(ia03Question)
// }));
// export const ucIa03Relations = relations(ucIa03, ({ one }) => ({
//     group: one(groupIa03, {
//         fields: [ucIa03.group_id],
//         references: [groupIa03.id]
//     })
// }));
// // IA01 Results Relations
// export const resultIa01HeaderRelations = relations(resultIa01Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultIa01Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultIa01)
// }));
// export const resultIa01Relations = relations(resultIa01, ({ one }) => ({
//     header: one(resultIa01Header, {
//         fields: [resultIa01.header_id],
//         references: [resultIa01Header.id]
//     }),
//     elementDetail: one(elementDetailsIa, {
//         fields: [resultIa01.element_detail_id],
//         references: [elementDetailsIa.id]
//     })
// }));
// // IA02 Results Relations
// export const resultIa02HeaderRelations = relations(resultIa02Header, ({ one }) => ({
//     result: one(result, {
//         fields: [resultIa02Header.result_id],
//         references: [result.id]
//     })
// }));
// // IA03 Questions & Results Relations
// export const ia03QuestionRelations = relations(ia03Question, ({ one, many }) => ({
//     group: one(groupIa03, {
//         fields: [ia03Question.group_id],
//         references: [groupIa03.id]
//     }),
//     rows: many(resultIa03)
// }));
// export const resultIa03HeaderRelations = relations(resultIa03Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultIa03Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultIa03)
// }));
// export const resultIa03Relations = relations(resultIa03, ({ one }) => ({
//     header: one(resultIa03Header, {
//         fields: [resultIa03.header_id],
//         references: [resultIa03Header.id]
//     }),
//     question: one(ia03Question, {
//         fields: [resultIa03.question_id],
//         references: [ia03Question.id]
//     })
// }));
// // IA05 Questions & Results Relations
// export const ia05QuestionRelations = relations(ia05Question, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [ia05Question.assessment_id],
//         references: [assessment.id]
//     }),
//     options: many(questionOption)
// }));
// export const questionOptionRelations = relations(questionOption, ({ one, many }) => ({
//     question: one(ia05Question, {
//         fields: [questionOption.question_id],
//         references: [ia05Question.id]
//     }),
//     rows: many(resultIa05)
// }));
// export const resultIa05HeaderRelations = relations(resultIa05Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultIa05Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultIa05)
// }));
// export const resultIa05Relations = relations(resultIa05, ({ one }) => ({
//     header: one(resultIa05Header, {
//         fields: [resultIa05.header_id],
//         references: [resultIa05Header.id]
//     }),
//     option: one(questionOption, {
//         fields: [resultIa05.option_id],
//         references: [questionOption.id]
//     })
// }));
// // IA07 Questions & Results Relations
// export const ia07QuestionRelations = relations(ia07Question, ({ one, many }) => ({
//     assessment: one(assessment, {
//         fields: [ia07Question.assessment_id],
//         references: [assessment.id]
//     }),
//     rows: many(resultIa07)
// }));
// export const resultIa07HeaderRelations = relations(resultIa07Header, ({ one, many }) => ({
//     result: one(result, {
//         fields: [resultIa07Header.result_id],
//         references: [result.id]
//     }),
//     rows: many(resultIa07)
// }));
// export const resultIa07Relations = relations(resultIa07, ({ one }) => ({
//     header: one(resultIa07Header, {
//         fields: [resultIa07.header_id],
//         references: [resultIa07Header.id]
//     }),
//     question: one(ia07Question, {
//         fields: [resultIa07.question_id],
//         references: [ia07Question.id]
//     })
// }));
// export const approvalRequestRelations = relations(approvalRequest, ({ one }) => ({
//     requester: one(admin, {
//         fields: [approvalRequest.requester_admin_id],
//         references: [admin.id]
//     }),
//     approver: one(admin, {
//         fields: [approvalRequest.approver_admin_id],
//         references: [admin.id]
//     }),
//     backupApprover: one(admin, {
//         fields: [approvalRequest.backup_admin_id],
//         references: [admin.id]
//     }),
//     approvedBy: one(admin, {
//         fields: [approvalRequest.approved_by],
//         references: [admin.id]
//     })
// }));
// export const adminRelations = relations(admin, ({ one, many }) => ({
//     user: one(user, {
//         fields: [admin.user_id],
//         references: [user.id]
//     }),
//     requestedApprovalRequests: many(approvalRequest, { relationName: 'requester' }),
//     receivedApprovalRequests: many(approvalRequest, { relationName: 'approver' }),
//     backupApprovalRequests: many(approvalRequest, { relationName: 'backupApprover' }),
//     approvedRequests: many(approvalRequest, { relationName: 'approvedBy' })
// }));
