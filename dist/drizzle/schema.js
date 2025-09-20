"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultIa05Header = exports.questionOption = exports.ia05Question = exports.resultIa03 = exports.resultIa03Header = exports.ia03Question = exports.resultIa02Header = exports.resultIa01 = exports.resultIa01Header = exports.ucIa03 = exports.groupIa03 = exports.ia02Pdf = exports.ia02Tool = exports.ucIa02 = exports.groupIa02 = exports.elementDetailsIa = exports.elementIa = exports.ucIa01 = exports.groupIa01 = exports.resultAk05 = exports.resultAk04 = exports.resultAk03 = exports.resultAk03Header = exports.ak02Evidence = exports.resultAk02 = exports.resultAk02Header = exports.resultAk01 = exports.resultAk01Header = exports.apl02Evidence = exports.resultApl02 = exports.resultApl02Header = exports.elementDetailsApl02 = exports.elementApl02 = exports.ucApl02 = exports.resultDoc = exports.result = exports.scheduleDetail = exports.assessmentSchedule = exports.assessment = exports.assesseeJob = exports.assessee = exports.assessorDetail = exports.assessor = exports.occupation = exports.scheme = exports.admin = exports.user = exports.role = exports.tukEnum = exports.genderEnum = void 0;
exports.ia05QuestionRelations = exports.resultIa03Relations = exports.resultIa03HeaderRelations = exports.ia03QuestionRelations = exports.resultIa02HeaderRelations = exports.resultIa01Relations = exports.resultIa01HeaderRelations = exports.ucIa03Relations = exports.groupIa03Relations = exports.ia02PdfRelations = exports.ia02ToolRelations = exports.ucIa02Relations = exports.groupIa02Relations = exports.elementDetailsIaRelations = exports.elementIaRelations = exports.ucIa01Relations = exports.groupIa01Relations = exports.resultAk05Relations = exports.resultAk04Relations = exports.resultAk03Relations = exports.resultAk03HeaderRelations = exports.ak02EvidenceRelations = exports.resultAk02Relations = exports.resultAk02HeaderRelations = exports.resultAk01Relations = exports.resultAk01HeaderRelations = exports.apl02EvidenceRelations = exports.resultApl02Relations = exports.resultApl02HeaderRelations = exports.elementDetailsApl02Relations = exports.elementApl02Relations = exports.ucApl02Relations = exports.resultDocRelations = exports.resultRelations = exports.scheduleDetailRelations = exports.assessmentScheduleRelations = exports.assessmentRelations = exports.assesseeJobRelations = exports.assesseeRelations = exports.assessorDetailRelations = exports.assessorRelations = exports.occupationRelations = exports.schemeRelations = exports.adminRelations = exports.userRelations = exports.roleRelations = exports.resultIa07 = exports.resultIa07Header = exports.ia07Question = exports.resultIa05 = void 0;
exports.resultIa07Relations = exports.resultIa07HeaderRelations = exports.ia07QuestionRelations = exports.resultIa05Relations = exports.resultIa05HeaderRelations = exports.questionOptionRelations = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
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
exports.admin = (0, mysql_core_1.mysqlTable)('admin', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), user_id: (0, mysql_core_1.int)('user_id').notNull().unique().references(() => exports.user.id, { onUpdate: 'cascade', onDelete: 'cascade' }), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), birth_date: (0, mysql_core_1.date)('birth_date').notNull() }, timestamps));
// ========= Master Data (Schemes, Occupations) =========
exports.scheme = (0, mysql_core_1.mysqlTable)('scheme', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), code: (0, mysql_core_1.varchar)('code', { length: 255 }).notNull(), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.occupation = (0, mysql_core_1.mysqlTable)('occupation', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), scheme_id: (0, mysql_core_1.int)('scheme_id').notNull().references(() => exports.scheme.id, { onUpdate: 'cascade', onDelete: 'cascade' }), name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull() }, timestamps));
exports.assessor = (0, mysql_core_1.mysqlTable)('assessor', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), user_id: (0, mysql_core_1.int)('user_id').notNull().unique().references(() => exports.user.id, { onUpdate: 'cascade', onDelete: 'cascade' }), scheme_id: (0, mysql_core_1.int)('scheme_id').notNull().references(() => exports.scheme.id, { onUpdate: 'cascade', onDelete: 'cascade' }), no_reg_met: (0, mysql_core_1.varchar)('no_reg_met', { length: 255 }).notNull(), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), birth_location: (0, mysql_core_1.varchar)('birth_location', { length: 255 }).notNull(), institution: (0, mysql_core_1.varchar)('institution', { length: 255 }).notNull(), birth_date: (0, mysql_core_1.date)('birth_date').notNull() }, timestamps));
exports.assessorDetail = (0, mysql_core_1.mysqlTable)('assessor_detail', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessor_id: (0, mysql_core_1.int)('assessor_id').notNull().unique().references(() => exports.assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }), tax_id_number: (0, mysql_core_1.varchar)('tax_id_number', { length: 255 }).notNull(), bank_book_cover: (0, mysql_core_1.varchar)('bank_book_cover', { length: 255 }).notNull(), certificate: (0, mysql_core_1.varchar)('certificate', { length: 255 }).notNull(), id_card: (0, mysql_core_1.varchar)('id_card', { length: 255 }).notNull(), national_id: (0, mysql_core_1.varchar)('national_id', { length: 255 }).notNull() }, timestamps));
exports.assessee = (0, mysql_core_1.mysqlTable)('assessee', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), user_id: (0, mysql_core_1.int)('user_id').notNull().references(() => exports.user.id, { onUpdate: 'cascade', onDelete: 'cascade' }), identity_number: (0, mysql_core_1.varchar)('identity_number', { length: 255 }).notNull(), birth_date: (0, mysql_core_1.date)('birth_date').notNull(), birth_location: (0, mysql_core_1.varchar)('birth_location', { length: 255 }).notNull(), gender: exports.genderEnum.notNull(), nationality: (0, mysql_core_1.varchar)('nationality', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), house_phone_no: (0, mysql_core_1.varchar)('house_phone_no', { length: 255 }), office_phone_no: (0, mysql_core_1.varchar)('office_phone_no', { length: 255 }), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), postal_code: (0, mysql_core_1.varchar)('postal_code', { length: 255 }), educational_qualifications: (0, mysql_core_1.varchar)('educational_qualifications', { length: 255 }).notNull() }, timestamps));
exports.assesseeJob = (0, mysql_core_1.mysqlTable)('assessee_job', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessee_id: (0, mysql_core_1.int)('assessee_id').notNull().unique().references(() => exports.assessee.id, { onUpdate: 'cascade', onDelete: 'cascade' }), institution_name: (0, mysql_core_1.varchar)('institution_name', { length: 255 }).notNull(), address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(), postal_code: (0, mysql_core_1.varchar)('postal_code', { length: 255 }).notNull(), position: (0, mysql_core_1.varchar)('position', { length: 255 }).notNull(), phone_no: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(), job_email: (0, mysql_core_1.varchar)('job_email', { length: 255 }).notNull() }, timestamps));
exports.assessment = (0, mysql_core_1.mysqlTable)('assessment', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), occupation_id: (0, mysql_core_1.int)('occupation_id').notNull().references(() => exports.occupation.id, { onUpdate: 'cascade', onDelete: 'cascade' }), code: (0, mysql_core_1.varchar)('code', { length: 255 }).notNull() }, timestamps));
exports.assessmentSchedule = (0, mysql_core_1.mysqlTable)('assessment_schedule', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), start_date: (0, mysql_core_1.timestamp)('start_date').notNull().defaultNow(), end_date: (0, mysql_core_1.timestamp)('end_date').notNull().defaultNow() }, timestamps));
exports.scheduleDetail = (0, mysql_core_1.mysqlTable)('schedule_detail', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), schedule_id: (0, mysql_core_1.int)('schedule_id').notNull().references(() => exports.assessmentSchedule.id, { onUpdate: 'cascade', onDelete: 'cascade' }), assessor_id: (0, mysql_core_1.int)('assessor_id').notNull().references(() => exports.assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }), location: (0, mysql_core_1.varchar)('location', { length: 255 }).notNull() }, timestamps));
exports.result = (0, mysql_core_1.mysqlTable)('result', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), assessment_id: (0, mysql_core_1.int)('assessment_id').notNull().references(() => exports.assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }), assessor_id: (0, mysql_core_1.int)('assessor_id').notNull().references(() => exports.assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }), assessee_id: (0, mysql_core_1.int)('assessee_id').notNull().references(() => exports.assessee.id, { onUpdate: 'cascade', onDelete: 'cascade' }), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull(), tuk: exports.tukEnum.notNull() }, timestamps));
exports.resultDoc = (0, mysql_core_1.mysqlTable)('result_doc', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), purpose: (0, mysql_core_1.varchar)('purpose', { length: 255 }).notNull(), school_report_card: (0, mysql_core_1.varchar)('school_report_card', { length: 255 }).notNull(), field_work_practice_certificate: (0, mysql_core_1.varchar)('field_work_practice_certificate', { length: 255 }).notNull(), student_card: (0, mysql_core_1.varchar)('student_card', { length: 255 }).notNull(), family_card: (0, mysql_core_1.varchar)('family_card', { length: 255 }).notNull(), id_card: (0, mysql_core_1.varchar)('id_card', { length: 255 }).notNull(), approved: (0, mysql_core_1.boolean)('approved').notNull() }, timestamps));
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
exports.resultIa01Header = (0, mysql_core_1.mysqlTable)('result_ia01_header', Object.assign({ id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(), result_id: (0, mysql_core_1.int)('result_id').notNull().unique().references(() => exports.result.id, { onUpdate: 'cascade', onDelete: 'cascade' }), approved_assessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(), approved_assessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(), is_competent: (0, mysql_core_1.boolean)('is_competent').notNull(), group: (0, mysql_core_1.varchar)('group', { length: 255 }), unit: (0, mysql_core_1.varchar)('unit', { length: 255 }), element: (0, mysql_core_1.varchar)('element', { length: 255 }), kuk: (0, mysql_core_1.varchar)('kuk', { length: 255 }) }, timestamps));
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
// ========= Relations =========
exports.roleRelations = (0, drizzle_orm_1.relations)(exports.role, ({ many }) => ({
    users: many(exports.user)
}));
exports.userRelations = (0, drizzle_orm_1.relations)(exports.user, ({ one, many }) => ({
    role: one(exports.role, {
        fields: [exports.user.role_id],
        references: [exports.role.id]
    }),
    assessees: many(exports.assessee),
    assessor: one(exports.assessor),
    admin: one(exports.admin)
}));
exports.adminRelations = (0, drizzle_orm_1.relations)(exports.admin, ({ one }) => ({
    user: one(exports.user, {
        fields: [exports.admin.user_id],
        references: [exports.user.id]
    })
}));
exports.schemeRelations = (0, drizzle_orm_1.relations)(exports.scheme, ({ many }) => ({
    occupations: many(exports.occupation),
    assessors: many(exports.assessor)
}));
exports.occupationRelations = (0, drizzle_orm_1.relations)(exports.occupation, ({ one, many }) => ({
    scheme: one(exports.scheme, {
        fields: [exports.occupation.scheme_id],
        references: [exports.scheme.id]
    }),
    assessments: many(exports.assessment)
}));
exports.assessorRelations = (0, drizzle_orm_1.relations)(exports.assessor, ({ one, many }) => ({
    user: one(exports.user, {
        fields: [exports.assessor.user_id],
        references: [exports.user.id]
    }),
    scheme: one(exports.scheme, {
        fields: [exports.assessor.scheme_id],
        references: [exports.scheme.id]
    }),
    scheduleDetails: many(exports.scheduleDetail),
    details: one(exports.assessorDetail),
    results: many(exports.result)
}));
exports.assessorDetailRelations = (0, drizzle_orm_1.relations)(exports.assessorDetail, ({ one }) => ({
    assessor: one(exports.assessor, {
        fields: [exports.assessorDetail.assessor_id],
        references: [exports.assessor.id]
    })
}));
exports.assesseeRelations = (0, drizzle_orm_1.relations)(exports.assessee, ({ one, many }) => ({
    user: one(exports.user, {
        fields: [exports.assessee.user_id],
        references: [exports.user.id]
    }),
    jobs: many(exports.assesseeJob),
    results: many(exports.result)
}));
exports.assesseeJobRelations = (0, drizzle_orm_1.relations)(exports.assesseeJob, ({ one }) => ({
    assessee: one(exports.assessee, {
        fields: [exports.assesseeJob.assessee_id],
        references: [exports.assessee.id]
    })
}));
exports.assessmentRelations = (0, drizzle_orm_1.relations)(exports.assessment, ({ one, many }) => ({
    occupation: one(exports.occupation, {
        fields: [exports.assessment.occupation_id],
        references: [exports.occupation.id]
    }),
    assessmentSchedules: many(exports.assessmentSchedule),
    results: many(exports.result),
    groupsIa01: many(exports.groupIa01),
    groupsIa02: many(exports.groupIa02),
    ia02Pdf: one(exports.ia02Pdf),
    groupsIa03: many(exports.groupIa03),
    ucApl02s: many(exports.ucApl02),
    ia05Questions: many(exports.ia05Question),
    ia07Questions: many(exports.ia07Question)
}));
exports.assessmentScheduleRelations = (0, drizzle_orm_1.relations)(exports.assessmentSchedule, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.assessmentSchedule.assessment_id],
        references: [exports.assessment.id]
    }),
    scheduleDetails: many(exports.scheduleDetail)
}));
exports.scheduleDetailRelations = (0, drizzle_orm_1.relations)(exports.scheduleDetail, ({ one }) => ({
    schedule: one(exports.assessmentSchedule, {
        fields: [exports.scheduleDetail.schedule_id],
        references: [exports.assessmentSchedule.id]
    }),
    assessor: one(exports.assessor, {
        fields: [exports.scheduleDetail.assessor_id],
        references: [exports.assessor.id]
    })
}));
exports.resultRelations = (0, drizzle_orm_1.relations)(exports.result, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.result.assessment_id],
        references: [exports.assessment.id]
    }),
    assessor: one(exports.assessor, {
        fields: [exports.result.assessor_id],
        references: [exports.assessor.id]
    }),
    assessee: one(exports.assessee, {
        fields: [exports.result.assessee_id],
        references: [exports.assessee.id]
    }),
    docs: many(exports.resultDoc),
    apl02Header: one(exports.resultApl02Header),
    ak01Header: one(exports.resultAk01Header),
    ak02Header: one(exports.resultAk02Header),
    ak03Header: one(exports.resultAk03Header),
    ak04: one(exports.resultAk04),
    ak05: one(exports.resultAk05),
    ia01Header: one(exports.resultIa01Header),
    ia02Header: one(exports.resultIa02Header),
    ia03Header: one(exports.resultIa03Header),
    ia05Header: one(exports.resultIa05Header),
    ia07Header: one(exports.resultIa07Header)
}));
exports.resultDocRelations = (0, drizzle_orm_1.relations)(exports.resultDoc, ({ one }) => ({
    result: one(exports.result, {
        fields: [exports.resultDoc.result_id],
        references: [exports.result.id]
    })
}));
// APL02 Relations
exports.ucApl02Relations = (0, drizzle_orm_1.relations)(exports.ucApl02, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.ucApl02.assessment_id],
        references: [exports.assessment.id]
    }),
    elements: many(exports.elementApl02),
    ak02Rows: many(exports.resultAk02)
}));
exports.elementApl02Relations = (0, drizzle_orm_1.relations)(exports.elementApl02, ({ one, many }) => ({
    uc: one(exports.ucApl02, {
        fields: [exports.elementApl02.uc_id],
        references: [exports.ucApl02.id]
    }),
    details: many(exports.elementDetailsApl02),
    results: many(exports.resultApl02)
}));
exports.elementDetailsApl02Relations = (0, drizzle_orm_1.relations)(exports.elementDetailsApl02, ({ one }) => ({
    element: one(exports.elementApl02, {
        fields: [exports.elementDetailsApl02.element_id],
        references: [exports.elementApl02.id]
    })
}));
exports.resultApl02HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultApl02Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultApl02Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultApl02)
}));
exports.resultApl02Relations = (0, drizzle_orm_1.relations)(exports.resultApl02, ({ one, many }) => ({
    header: one(exports.resultApl02Header, {
        fields: [exports.resultApl02.result_apl02_id],
        references: [exports.resultApl02Header.id]
    }),
    element: one(exports.elementApl02, {
        fields: [exports.resultApl02.element_id],
        references: [exports.elementApl02.id]
    }),
    evidences: many(exports.apl02Evidence)
}));
exports.apl02EvidenceRelations = (0, drizzle_orm_1.relations)(exports.apl02Evidence, ({ one }) => ({
    row: one(exports.resultApl02, {
        fields: [exports.apl02Evidence.result_apl02_id],
        references: [exports.resultApl02.id]
    })
}));
// AK01-AK05 Relations
exports.resultAk01HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultAk01Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultAk01Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultAk01)
}));
exports.resultAk01Relations = (0, drizzle_orm_1.relations)(exports.resultAk01, ({ one }) => ({
    header: one(exports.resultAk01Header, {
        fields: [exports.resultAk01.header_id],
        references: [exports.resultAk01Header.id]
    })
}));
exports.resultAk02HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultAk02Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultAk02Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultAk02)
}));
exports.resultAk02Relations = (0, drizzle_orm_1.relations)(exports.resultAk02, ({ one, many }) => ({
    header: one(exports.resultAk02Header, {
        fields: [exports.resultAk02.header_id],
        references: [exports.resultAk02Header.id]
    }),
    uc: one(exports.ucApl02, {
        fields: [exports.resultAk02.uc_id],
        references: [exports.ucApl02.id]
    }),
    evidences: many(exports.ak02Evidence)
}));
exports.ak02EvidenceRelations = (0, drizzle_orm_1.relations)(exports.ak02Evidence, ({ one }) => ({
    row: one(exports.resultAk02, {
        fields: [exports.ak02Evidence.result_ak02_id],
        references: [exports.resultAk02.id]
    })
}));
exports.resultAk03HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultAk03Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultAk03Header.result_id],
        references: [exports.result.id]
    }),
    answers: many(exports.resultAk03)
}));
exports.resultAk03Relations = (0, drizzle_orm_1.relations)(exports.resultAk03, ({ one }) => ({
    header: one(exports.resultAk03Header, {
        fields: [exports.resultAk03.header_id],
        references: [exports.resultAk03Header.id]
    })
}));
exports.resultAk04Relations = (0, drizzle_orm_1.relations)(exports.resultAk04, ({ one }) => ({
    result: one(exports.result, {
        fields: [exports.resultAk04.result_id],
        references: [exports.result.id]
    })
}));
exports.resultAk05Relations = (0, drizzle_orm_1.relations)(exports.resultAk05, ({ one }) => ({
    result: one(exports.result, {
        fields: [exports.resultAk05.result_id],
        references: [exports.result.id]
    })
}));
// IA01-IA03 Structure Relations
exports.groupIa01Relations = (0, drizzle_orm_1.relations)(exports.groupIa01, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.groupIa01.assessment_id],
        references: [exports.assessment.id]
    }),
    units: many(exports.ucIa01)
}));
exports.ucIa01Relations = (0, drizzle_orm_1.relations)(exports.ucIa01, ({ one, many }) => ({
    group: one(exports.groupIa01, {
        fields: [exports.ucIa01.group_id],
        references: [exports.groupIa01.id]
    }),
    elements: many(exports.elementIa)
}));
exports.elementIaRelations = (0, drizzle_orm_1.relations)(exports.elementIa, ({ one, many }) => ({
    uc: one(exports.ucIa01, {
        fields: [exports.elementIa.uc_id],
        references: [exports.ucIa01.id]
    }),
    details: many(exports.elementDetailsIa)
}));
exports.elementDetailsIaRelations = (0, drizzle_orm_1.relations)(exports.elementDetailsIa, ({ one, many }) => ({
    element: one(exports.elementIa, {
        fields: [exports.elementDetailsIa.element_id],
        references: [exports.elementIa.id]
    }),
    results: many(exports.resultIa01)
}));
exports.groupIa02Relations = (0, drizzle_orm_1.relations)(exports.groupIa02, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.groupIa02.assessment_id],
        references: [exports.assessment.id]
    }),
    tools: many(exports.ia02Tool),
    units: many(exports.ucIa02)
}));
exports.ucIa02Relations = (0, drizzle_orm_1.relations)(exports.ucIa02, ({ one }) => ({
    group: one(exports.groupIa02, {
        fields: [exports.ucIa02.group_id],
        references: [exports.groupIa02.id]
    })
}));
exports.ia02ToolRelations = (0, drizzle_orm_1.relations)(exports.ia02Tool, ({ one }) => ({
    group: one(exports.groupIa02, {
        fields: [exports.ia02Tool.group_id],
        references: [exports.groupIa02.id]
    })
}));
exports.ia02PdfRelations = (0, drizzle_orm_1.relations)(exports.ia02Pdf, ({ one }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.ia02Pdf.assessment_id],
        references: [exports.assessment.id]
    })
}));
exports.groupIa03Relations = (0, drizzle_orm_1.relations)(exports.groupIa03, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.groupIa03.assessment_id],
        references: [exports.assessment.id]
    }),
    units: many(exports.ucIa03),
    questions: many(exports.ia03Question)
}));
exports.ucIa03Relations = (0, drizzle_orm_1.relations)(exports.ucIa03, ({ one }) => ({
    group: one(exports.groupIa03, {
        fields: [exports.ucIa03.group_id],
        references: [exports.groupIa03.id]
    })
}));
// IA01 Results Relations
exports.resultIa01HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultIa01Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultIa01Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultIa01)
}));
exports.resultIa01Relations = (0, drizzle_orm_1.relations)(exports.resultIa01, ({ one }) => ({
    header: one(exports.resultIa01Header, {
        fields: [exports.resultIa01.header_id],
        references: [exports.resultIa01Header.id]
    }),
    elementDetail: one(exports.elementDetailsIa, {
        fields: [exports.resultIa01.element_detail_id],
        references: [exports.elementDetailsIa.id]
    })
}));
// IA02 Results Relations
exports.resultIa02HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultIa02Header, ({ one }) => ({
    result: one(exports.result, {
        fields: [exports.resultIa02Header.result_id],
        references: [exports.result.id]
    })
}));
// IA03 Questions & Results Relations
exports.ia03QuestionRelations = (0, drizzle_orm_1.relations)(exports.ia03Question, ({ one, many }) => ({
    group: one(exports.groupIa03, {
        fields: [exports.ia03Question.group_id],
        references: [exports.groupIa03.id]
    }),
    rows: many(exports.resultIa03)
}));
exports.resultIa03HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultIa03Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultIa03Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultIa03)
}));
exports.resultIa03Relations = (0, drizzle_orm_1.relations)(exports.resultIa03, ({ one }) => ({
    header: one(exports.resultIa03Header, {
        fields: [exports.resultIa03.header_id],
        references: [exports.resultIa03Header.id]
    }),
    question: one(exports.ia03Question, {
        fields: [exports.resultIa03.question_id],
        references: [exports.ia03Question.id]
    })
}));
// IA05 Questions & Results Relations
exports.ia05QuestionRelations = (0, drizzle_orm_1.relations)(exports.ia05Question, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.ia05Question.assessment_id],
        references: [exports.assessment.id]
    }),
    options: many(exports.questionOption)
}));
exports.questionOptionRelations = (0, drizzle_orm_1.relations)(exports.questionOption, ({ one, many }) => ({
    question: one(exports.ia05Question, {
        fields: [exports.questionOption.question_id],
        references: [exports.ia05Question.id]
    }),
    rows: many(exports.resultIa05)
}));
exports.resultIa05HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultIa05Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultIa05Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultIa05)
}));
exports.resultIa05Relations = (0, drizzle_orm_1.relations)(exports.resultIa05, ({ one }) => ({
    header: one(exports.resultIa05Header, {
        fields: [exports.resultIa05.header_id],
        references: [exports.resultIa05Header.id]
    }),
    option: one(exports.questionOption, {
        fields: [exports.resultIa05.option_id],
        references: [exports.questionOption.id]
    })
}));
// IA07 Questions & Results Relations
exports.ia07QuestionRelations = (0, drizzle_orm_1.relations)(exports.ia07Question, ({ one, many }) => ({
    assessment: one(exports.assessment, {
        fields: [exports.ia07Question.assessment_id],
        references: [exports.assessment.id]
    }),
    rows: many(exports.resultIa07)
}));
exports.resultIa07HeaderRelations = (0, drizzle_orm_1.relations)(exports.resultIa07Header, ({ one, many }) => ({
    result: one(exports.result, {
        fields: [exports.resultIa07Header.result_id],
        references: [exports.result.id]
    }),
    rows: many(exports.resultIa07)
}));
exports.resultIa07Relations = (0, drizzle_orm_1.relations)(exports.resultIa07, ({ one }) => ({
    header: one(exports.resultIa07Header, {
        fields: [exports.resultIa07.header_id],
        references: [exports.resultIa07Header.id]
    }),
    question: one(exports.ia07Question, {
        fields: [exports.resultIa07.question_id],
        references: [exports.ia07Question.id]
    })
}));
