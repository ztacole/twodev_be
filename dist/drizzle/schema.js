"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ia07Question = exports.ia02Pdf = exports.ia02Tool = exports.ucIa02 = exports.groupIa02 = exports.resultIa05 = exports.resultIa05Header = exports.questionOption = exports.ia05Question = exports.resultIa03 = exports.resultIa03Header = exports.ia03Question = exports.ucIa03 = exports.groupIa03 = exports.resultIa02Header = exports.resultIa01 = exports.resultIa01Header = exports.elementDetailsIa = exports.elementIa = exports.ucIa01 = exports.groupIa01 = exports.resultAk05 = exports.resultAk04 = exports.resultAk03 = exports.resultAk03Header = exports.ak02Evidence = exports.resultAk02 = exports.resultAk02Header = exports.resultAk01 = exports.resultAk01Header = exports.apl02Evidence = exports.resultApl02 = exports.resultApl02Header = exports.elementDetailsApl02 = exports.elementApl02 = exports.ucApl02 = exports.resultDoc = exports.result = exports.scheduleDetail = exports.assessmentSchedule = exports.assessment = exports.assesseeJob = exports.assessee = exports.assessorDetail = exports.assessor = exports.occupation = exports.scheme = exports.admin = exports.user = exports.role = void 0;
exports.resultIa07 = exports.resultIa07Header = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// ========= Enums =========
// Note: use inline mysqlEnum in columns to avoid callability typing issues
// ========= Core RBAC & Users =========
exports.role = (0, mysql_core_1.mysqlTable)('role', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.user = (0, mysql_core_1.mysqlTable)('user', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    fullName: (0, mysql_core_1.varchar)('full_name', { length: 255 }).notNull(),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }).notNull(),
    password: (0, mysql_core_1.varchar)('password', { length: 255 }).notNull(),
    roleId: (0, mysql_core_1.int)('role_id').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    emailUnique: (0, mysql_core_1.unique)('user_email_unique').on(t.email),
    roleIdx: (0, mysql_core_1.index)('user_role_id_idx').on(t.roleId),
}));
exports.admin = (0, mysql_core_1.mysqlTable)('admin', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(),
    phoneNo: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(),
    birthDate: (0, mysql_core_1.timestamp)('birth_date', { mode: 'date' }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    userUnique: (0, mysql_core_1.unique)('admin_user_id_unique').on(t.userId),
}));
// ========= Master Data =========
exports.scheme = (0, mysql_core_1.mysqlTable)('scheme', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    code: (0, mysql_core_1.varchar)('code', { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.occupation = (0, mysql_core_1.mysqlTable)('occupation', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    schemeId: (0, mysql_core_1.int)('scheme_id').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    schemeIdx: (0, mysql_core_1.index)('occupation_scheme_id_idx').on(t.schemeId),
}));
// ========= Personae =========
exports.assessor = (0, mysql_core_1.mysqlTable)('assessor', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    schemeId: (0, mysql_core_1.int)('scheme_id').notNull(),
    noRegMet: (0, mysql_core_1.varchar)('no_reg_met', { length: 255 }).notNull(),
    address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(),
    phoneNo: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(),
    birthDate: (0, mysql_core_1.timestamp)('birth_date', { mode: 'date' }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    userUnique: (0, mysql_core_1.unique)('assessor_user_id_unique').on(t.userId),
    schemeIdx: (0, mysql_core_1.index)('assessor_scheme_id_idx').on(t.schemeId),
}));
exports.assessorDetail = (0, mysql_core_1.mysqlTable)('assessor_detail', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessorId: (0, mysql_core_1.int)('assessor_id').notNull(),
    taxIdNumber: (0, mysql_core_1.varchar)('tax_id_number', { length: 255 }).notNull(),
    bankBookCover: (0, mysql_core_1.varchar)('bank_book_cover', { length: 255 }).notNull(),
    certificate: (0, mysql_core_1.varchar)('certificate', { length: 255 }).notNull(),
    nationalId: (0, mysql_core_1.varchar)('national_id', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    assessorUnique: (0, mysql_core_1.unique)('assessor_detail_assessor_id_unique').on(t.assessorId),
}));
exports.assessee = (0, mysql_core_1.mysqlTable)('assessee', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    identityNumber: (0, mysql_core_1.varchar)('identity_number', { length: 255 }).notNull(),
    birthDate: (0, mysql_core_1.timestamp)('birth_date', { mode: 'date' }).notNull(),
    birthLocation: (0, mysql_core_1.varchar)('birth_location', { length: 255 }).notNull(),
    gender: (0, mysql_core_1.mysqlEnum)('gender', ['male', 'female']).notNull(),
    nationality: (0, mysql_core_1.varchar)('nationality', { length: 255 }).notNull(),
    phoneNo: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(),
    housePhoneNo: (0, mysql_core_1.varchar)('house_phone_no', { length: 255 }),
    officePhoneNo: (0, mysql_core_1.varchar)('office_phone_no', { length: 255 }),
    address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(),
    postalCode: (0, mysql_core_1.varchar)('postal_code', { length: 255 }),
    educationalQualifications: (0, mysql_core_1.varchar)('educational_qualifications', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.assesseeJob = (0, mysql_core_1.mysqlTable)('assessee_job', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assesseeId: (0, mysql_core_1.int)('assessee_id').notNull(),
    institutionName: (0, mysql_core_1.varchar)('institution_name', { length: 255 }).notNull(),
    address: (0, mysql_core_1.varchar)('address', { length: 255 }).notNull(),
    postalCode: (0, mysql_core_1.varchar)('postal_code', { length: 255 }).notNull(),
    position: (0, mysql_core_1.varchar)('position', { length: 255 }).notNull(),
    phoneNo: (0, mysql_core_1.varchar)('phone_no', { length: 255 }).notNull(),
    jobEmail: (0, mysql_core_1.varchar)('job_email', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    assesseeUnique: (0, mysql_core_1.unique)('assessee_job_assessee_id_unique').on(t.assesseeId),
}));
// ========= Assessment (generic) =========
exports.assessment = (0, mysql_core_1.mysqlTable)('assessment', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    occupationId: (0, mysql_core_1.int)('occupation_id').notNull(),
    code: (0, mysql_core_1.varchar)('code', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    occupationIdx: (0, mysql_core_1.index)('assessment_occupation_id_idx').on(t.occupationId),
}));
exports.assessmentSchedule = (0, mysql_core_1.mysqlTable)('assessment_schedule', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    startDate: (0, mysql_core_1.timestamp)('start_date', { mode: 'date' }).notNull(),
    endDate: (0, mysql_core_1.timestamp)('end_date', { mode: 'date' }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    assessmentIdx: (0, mysql_core_1.index)('assessment_schedule_assessment_id_idx').on(t.assessmentId),
}));
exports.scheduleDetail = (0, mysql_core_1.mysqlTable)('schedule_detail', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    scheduleId: (0, mysql_core_1.int)('schedule_id').notNull(),
    assessorId: (0, mysql_core_1.int)('assessor_id').notNull(),
    location: (0, mysql_core_1.varchar)('location', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
// ========= Result (Umum + Dokumen) =========
exports.result = (0, mysql_core_1.mysqlTable)('result', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    assessorId: (0, mysql_core_1.int)('assessor_id').notNull(),
    assesseeId: (0, mysql_core_1.int)('assessee_id').notNull(),
    isCompetent: (0, mysql_core_1.boolean)('is_competent').notNull(),
    tuk: (0, mysql_core_1.mysqlEnum)('tuk', ['sewaktu', 'tempat_kerja', 'mandiri']).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultDoc = (0, mysql_core_1.mysqlTable)('result_doc', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    purpose: (0, mysql_core_1.varchar)('purpose', { length: 255 }).notNull(),
    schoolReportCard: (0, mysql_core_1.varchar)('school_report_card', { length: 255 }).notNull(),
    fieldWorkPracticeCertificate: (0, mysql_core_1.varchar)('field_work_practice_certificate', { length: 255 }).notNull(),
    studentCard: (0, mysql_core_1.varchar)('student_card', { length: 255 }).notNull(),
    familyCard: (0, mysql_core_1.varchar)('family_card', { length: 255 }).notNull(),
    idCard: (0, mysql_core_1.varchar)('id_card', { length: 255 }).notNull(),
    approved: (0, mysql_core_1.boolean)('approved').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
// ========= APL02 =========
exports.ucApl02 = (0, mysql_core_1.mysqlTable)('uc_apl02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    unitCode: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.elementApl02 = (0, mysql_core_1.mysqlTable)('element_apl02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    ucId: (0, mysql_core_1.int)('uc_id').notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.elementDetailsApl02 = (0, mysql_core_1.mysqlTable)('element_details_apl02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    elementId: (0, mysql_core_1.int)('element_id').notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultApl02Header = (0, mysql_core_1.mysqlTable)('result_apl02_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    isContinue: (0, mysql_core_1.boolean)('is_continue').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_apl02_header_result_id_unique').on(t.resultId),
}));
exports.resultApl02 = (0, mysql_core_1.mysqlTable)('result_apl02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultApl02Id: (0, mysql_core_1.int)('result_apl02_id').notNull(),
    elementId: (0, mysql_core_1.int)('element_id').notNull(),
    isCompetent: (0, mysql_core_1.boolean)('is_competent').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    uniq: (0, mysql_core_1.unique)('result_apl02_unique').on(t.resultApl02Id, t.elementId),
}));
exports.apl02Evidence = (0, mysql_core_1.mysqlTable)('apl02_evidence', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultApl02Id: (0, mysql_core_1.int)('result_apl02_id').notNull(),
    evidence: (0, mysql_core_1.varchar)('evidence', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
// ========= AK01 / AK02 / AK03 / AK04 / AK05 =========
exports.resultAk01Header = (0, mysql_core_1.mysqlTable)('result_ak01_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ak01_header_result_id_unique').on(t.resultId),
}));
exports.resultAk01 = (0, mysql_core_1.mysqlTable)('result_ak01', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    evidence: (0, mysql_core_1.varchar)('evidence', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultAk02Header = (0, mysql_core_1.mysqlTable)('result_ak02_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    isCompetent: (0, mysql_core_1.boolean)('is_competent').notNull(),
    followUp: (0, mysql_core_1.text)('follow_up'),
    comment: (0, mysql_core_1.text)('comment'),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ak02_header_result_id_unique').on(t.resultId),
}));
exports.resultAk02 = (0, mysql_core_1.mysqlTable)('result_ak02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    ucId: (0, mysql_core_1.int)('uc_id').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ak02Evidence = (0, mysql_core_1.mysqlTable)('ak02_evidence', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultAk02Id: (0, mysql_core_1.int)('result_ak02_id').notNull(),
    evidence: (0, mysql_core_1.varchar)('evidence', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultAk03Header = (0, mysql_core_1.mysqlTable)('result_ak03_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    comment: (0, mysql_core_1.varchar)('comment', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ak03_header_result_id_unique').on(t.resultId),
}));
exports.resultAk03 = (0, mysql_core_1.mysqlTable)('result_ak03', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    question: (0, mysql_core_1.varchar)('question', { length: 255 }).notNull(),
    answer: (0, mysql_core_1.boolean)('answer').notNull(),
    comment: (0, mysql_core_1.varchar)('comment', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultAk04 = (0, mysql_core_1.mysqlTable)('result_ak04', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    q1Yes: (0, mysql_core_1.boolean)('q1_yes').notNull(),
    q2Yes: (0, mysql_core_1.boolean)('q2_yes').notNull(),
    q3Yes: (0, mysql_core_1.boolean)('q3_yes').notNull(),
    reason: (0, mysql_core_1.varchar)('reason', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ak04_result_id_unique').on(t.resultId),
}));
exports.resultAk05 = (0, mysql_core_1.mysqlTable)('result_ak05', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    isCompetent: (0, mysql_core_1.boolean)('is_competent').notNull(),
    description: (0, mysql_core_1.varchar)('description', { length: 255 }),
    negativePositiveAspects: (0, mysql_core_1.varchar)('negative_positive_aspects', { length: 255 }),
    rejectionNotes: (0, mysql_core_1.varchar)('rejection_notes', { length: 255 }),
    improvementSuggestions: (0, mysql_core_1.varchar)('improvement_suggestions', { length: 255 }),
    notes: (0, mysql_core_1.varchar)('notes', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ak05_result_id_unique').on(t.resultId),
}));
// ========= IA01 Structure =========
exports.groupIa01 = (0, mysql_core_1.mysqlTable)('group_ia01', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ucIa01 = (0, mysql_core_1.mysqlTable)('uc_ia01', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    groupId: (0, mysql_core_1.int)('group_id').notNull(),
    unitCode: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.elementIa = (0, mysql_core_1.mysqlTable)('element_ia', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    ucId: (0, mysql_core_1.int)('uc_id').notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.elementDetailsIa = (0, mysql_core_1.mysqlTable)('element_details_ia', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    elementId: (0, mysql_core_1.int)('element_id').notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    benchmark: (0, mysql_core_1.varchar)('benchmark', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultIa01Header = (0, mysql_core_1.mysqlTable)('result_ia01_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    isCompetent: (0, mysql_core_1.boolean)('is_competent').notNull(),
    group: (0, mysql_core_1.varchar)('group', { length: 255 }),
    unit: (0, mysql_core_1.varchar)('unit', { length: 255 }),
    element: (0, mysql_core_1.varchar)('element', { length: 255 }),
    kuk: (0, mysql_core_1.varchar)('kuk', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ia01_header_result_id_unique').on(t.resultId),
}));
exports.resultIa01 = (0, mysql_core_1.mysqlTable)('result_ia01', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    elementDetailId: (0, mysql_core_1.int)('element_detail_id').notNull(),
    isCompetent: (0, mysql_core_1.boolean)('is_competent').notNull(),
    evaluation: (0, mysql_core_1.text)('evaluation').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    uniq: (0, mysql_core_1.unique)('result_ia01_unique').on(t.headerId, t.elementDetailId),
}));
// ========= IA02 (header saja) =========
exports.resultIa02Header = (0, mysql_core_1.mysqlTable)('result_ia02_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ia02_header_result_id_unique').on(t.resultId),
}));
// ========= IA03 =========
exports.groupIa03 = (0, mysql_core_1.mysqlTable)('group_ia03', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ucIa03 = (0, mysql_core_1.mysqlTable)('uc_ia03', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    groupId: (0, mysql_core_1.int)('group_id').notNull(),
    unitCode: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ia03Question = (0, mysql_core_1.mysqlTable)('ia03_question', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    groupId: (0, mysql_core_1.int)('group_id').notNull(),
    question: (0, mysql_core_1.varchar)('question', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultIa03Header = (0, mysql_core_1.mysqlTable)('result_ia03_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ia03_header_result_id_unique').on(t.resultId),
}));
exports.resultIa03 = (0, mysql_core_1.mysqlTable)('result_ia03', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    questionId: (0, mysql_core_1.int)('question_id').notNull(),
    answer: (0, mysql_core_1.varchar)('answer', { length: 255 }).notNull(),
    approved: (0, mysql_core_1.boolean)('approved').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    uniq: (0, mysql_core_1.unique)('result_ia03_unique').on(t.headerId, t.questionId),
}));
// ========= IA05 (PG) =========
exports.ia05Question = (0, mysql_core_1.mysqlTable)('ia05_question', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    order: (0, mysql_core_1.int)('order').notNull(),
    question: (0, mysql_core_1.varchar)('question', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.questionOption = (0, mysql_core_1.mysqlTable)('question_option', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    questionId: (0, mysql_core_1.int)('question_id').notNull(),
    option: (0, mysql_core_1.text)('option').notNull(),
    isAnswer: (0, mysql_core_1.boolean)('is_answer').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultIa05Header = (0, mysql_core_1.mysqlTable)('result_ia05_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    isAchieved: (0, mysql_core_1.boolean)('is_achieved').notNull(),
    unit: (0, mysql_core_1.varchar)('unit', { length: 255 }),
    element: (0, mysql_core_1.varchar)('element', { length: 255 }),
    kuk: (0, mysql_core_1.varchar)('kuk', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ia05_header_result_id_unique').on(t.resultId),
}));
exports.resultIa05 = (0, mysql_core_1.mysqlTable)('result_ia05', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    optionId: (0, mysql_core_1.int)('option_id').notNull(),
    approved: (0, mysql_core_1.boolean)('approved').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    uniq: (0, mysql_core_1.unique)('result_ia05_unique').on(t.headerId, t.optionId),
}));
// ========= IA02 grouping/tools/pdfs =========
exports.groupIa02 = (0, mysql_core_1.mysqlTable)('group_ia02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    scenario: (0, mysql_core_1.text)('scenario').notNull(),
    duration: (0, mysql_core_1.int)('duration').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ucIa02 = (0, mysql_core_1.mysqlTable)('uc_ia02', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    groupId: (0, mysql_core_1.int)('group_id').notNull(),
    unitCode: (0, mysql_core_1.varchar)('unit_code', { length: 255 }).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ia02Tool = (0, mysql_core_1.mysqlTable)('ia02_tool', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    groupId: (0, mysql_core_1.int)('group_id').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.ia02Pdf = (0, mysql_core_1.mysqlTable)('ia02_pdf', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    groupId: (0, mysql_core_1.int)('group_id').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    groupUnique: (0, mysql_core_1.unique)('ia02_pdf_group_id_unique').on(t.groupId),
}));
// ========= IA07 =========
exports.ia07Question = (0, mysql_core_1.mysqlTable)('ia07_question', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    assessmentId: (0, mysql_core_1.int)('assessment_id').notNull(),
    question: (0, mysql_core_1.text)('question').notNull(),
    answerKey: (0, mysql_core_1.text)('answer_key').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
exports.resultIa07Header = (0, mysql_core_1.mysqlTable)('result_ia07_header', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    resultId: (0, mysql_core_1.int)('result_id').notNull(),
    approvedAssessee: (0, mysql_core_1.boolean)('approved_assessee').notNull(),
    approvedAssessor: (0, mysql_core_1.boolean)('approved_assessor').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    resultUnique: (0, mysql_core_1.unique)('result_ia07_header_result_id_unique').on(t.resultId),
}));
exports.resultIa07 = (0, mysql_core_1.mysqlTable)('result_ia07', {
    id: (0, mysql_core_1.int)('id').autoincrement().primaryKey(),
    headerId: (0, mysql_core_1.int)('header_id').notNull(),
    questionId: (0, mysql_core_1.int)('question_id').notNull(),
    approved: (0, mysql_core_1.boolean)('approved').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
