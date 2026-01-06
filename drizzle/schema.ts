import { mysqlTable, int, varchar, date, boolean, text, mysqlEnum, unique, timestamp, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { time } from 'console';

// ========= Enums =========
export const genderEnum = mysqlEnum('gender', ['male', 'female']);
export const tukEnum = mysqlEnum('tuk', ['sewaktu', 'tempat_kerja', 'mandiri']);
const timestamps = {
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
};

// ========= Core RBAC & Users =========
export const role = mysqlTable('role', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps
});

export const user = mysqlTable('user', {
    id: int('id').primaryKey().autoincrement(),
    full_name: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role_id: int('role_id').notNull().references(() => role.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    ...timestamps
});

export const admin = mysqlTable('admin', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull().unique().references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    address: varchar('address', { length: 255 }).notNull(),
    phone_no: varchar('phone_no', { length: 255 }).notNull(),
    birth_date: date('birth_date').notNull(),
    can_approve: boolean('can_approve').notNull().default(false),
    signature: varchar('signature', { length: 255 }),
    ...timestamps
});

// ========= Master Data (Schemes, Occupations) =========
export const scheme = mysqlTable('scheme', {
    id: int('id').primaryKey().autoincrement(),
    code: varchar('code', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps
});

export const occupation = mysqlTable('occupation', {
    id: int('id').primaryKey().autoincrement(),
    scheme_id: int('scheme_id').notNull().references(() => scheme.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps
});

export const assessor = mysqlTable('assessor', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull().unique().references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    scheme_id: int('scheme_id').notNull().references(() => scheme.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    no_reg_met: varchar('no_reg_met', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    phone_no: varchar('phone_no', { length: 255 }).notNull(),
    birth_location: varchar('birth_location', { length: 255 }).notNull(),
    institution: varchar('institution', { length: 255 }).notNull(),
    birth_date: date('birth_date').notNull(),
    signature: varchar('signature', { length: 255 }),
    ...timestamps
});

export const assessorDetail = mysqlTable('assessor_detail', {
    id: int('id').primaryKey().autoincrement(),
    assessor_id: int('assessor_id').notNull().unique().references(() => assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    tax_id_number: varchar('tax_id_number', { length: 255 }).notNull(),
    bank_book_cover: varchar('bank_book_cover', { length: 255 }).notNull(),
    certificate: varchar('certificate', { length: 255 }).notNull(),
    id_card: varchar('id_card', { length: 255 }).notNull(),
    national_id: varchar('national_id', { length: 255 }).notNull(),
    ...timestamps
});

export const assessee = mysqlTable('assessee', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull().references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    identity_number: varchar('identity_number', { length: 255 }).notNull(),
    birth_date: date('birth_date').notNull(),
    birth_location: varchar('birth_location', { length: 255 }).notNull(),
    gender: genderEnum.notNull(),
    nationality: varchar('nationality', { length: 255 }).notNull(),
    phone_no: varchar('phone_no', { length: 255 }).notNull(),
    house_phone_no: varchar('house_phone_no', { length: 255 }),
    office_phone_no: varchar('office_phone_no', { length: 255 }),
    address: varchar('address', { length: 255 }).notNull(),
    postal_code: varchar('postal_code', { length: 255 }),
    educational_qualifications: varchar('educational_qualifications', { length: 255 }).notNull(),
    signature: varchar('signature', { length: 255 }),
    ...timestamps
});

export const assesseeJob = mysqlTable('assessee_job', {
    id: int('id').primaryKey().autoincrement(),
    assessee_id: int('assessee_id').notNull().unique().references(() => assessee.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    institution_name: varchar('institution_name', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    postal_code: varchar('postal_code', { length: 255 }).notNull(),
    position: varchar('position', { length: 255 }).notNull(),
    phone_no: varchar('phone_no', { length: 255 }).notNull(),
    job_email: varchar('job_email', { length: 255 }).notNull(),
    ...timestamps
});

export const assessment = mysqlTable('assessment', {
    id: int('id').primaryKey().autoincrement(),
    occupation_id: int('occupation_id').notNull().references(() => occupation.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    code: varchar('code', { length: 255 }).notNull(),
    ...timestamps
});

export const assessmentSchedule = mysqlTable('assessment_schedule', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    start_date: timestamp('start_date').notNull().defaultNow(),
    end_date: timestamp('end_date').notNull().defaultNow(),
    ...timestamps
});

export const scheduleDetail = mysqlTable('schedule_detail', {
    id: int('id').primaryKey().autoincrement(),
    schedule_id: int('schedule_id').notNull().references(() => assessmentSchedule.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    assessor_id: int('assessor_id').notNull().references(() => assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    location: varchar('location', { length: 255 }).notNull(),
    ...timestamps
});

export const result = mysqlTable('result', {
    id: int('id').primaryKey().autoincrement(),
    // assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    assessor_id: int('assessor_id').notNull().references(() => assessor.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    assessee_id: int('assessee_id').notNull().references(() => assessee.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    schedule_id: int('schedule_id').notNull().references(() => assessmentSchedule.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    score: int('score').default(-1),
    is_competent: boolean('is_competent').notNull(),
    tuk: tukEnum.notNull(),
    ...timestamps
});

export const resultDoc = mysqlTable('result_doc', {
    id: int('id').primaryKey().autoincrement(),
    admin_id: int('admin_id'),
    result_id: int('result_id').notNull().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    purpose: varchar('purpose', { length: 255 }).notNull(),
    school_report_card: varchar('school_report_card', { length: 255 }).notNull(),
    field_work_practice_certificate: varchar('field_work_practice_certificate', { length: 255 }).notNull(),
    student_card: varchar('student_card', { length: 255 }).notNull(),
    family_card: varchar('family_card', { length: 255 }).notNull(),
    id_card: varchar('id_card', { length: 255 }).notNull(),
    approved: boolean('approved').notNull(),
    ...timestamps
});

export const ucApl02 = mysqlTable('uc_apl02', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    unit_code: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    ...timestamps
});

export const elementApl02 = mysqlTable('element_apl02', {
    id: int('id').primaryKey().autoincrement(),
    uc_id: int('uc_id').notNull().references(() => ucApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    ...timestamps
});

export const elementDetailsApl02 = mysqlTable('element_details_apl02', {
    id: int('id').primaryKey().autoincrement(),
    element_id: int('element_id').notNull().references(() => elementApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    description: text('description').notNull(),
    ...timestamps
});

export const resultApl02Header = mysqlTable('result_apl02_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    is_continue: boolean('is_continue').notNull(),
    ...timestamps
});

export const resultApl02 = mysqlTable('result_apl02', {
    id: int('id').primaryKey().autoincrement(),
    result_apl02_id: int('result_apl02_id').notNull().references(() => resultApl02Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    element_id: int('element_id').notNull().references(() => elementApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    is_competent: boolean('is_competent').notNull(),
    ...timestamps
}, (table) => ({
    uniqueResultElement: unique().on(table.result_apl02_id, table.element_id)
}));

export const apl02Evidence = mysqlTable('apl02_evidence', {
    id: int('id').primaryKey().autoincrement(),
    result_apl02_id: int('result_apl02_id').notNull().references(() => resultApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    evidence: varchar('evidence', { length: 255 }).notNull(),
    ...timestamps
});

export const resultAk01Header = mysqlTable('result_ak01_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    ...timestamps
});

export const resultAk01 = mysqlTable('result_ak01', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultAk01Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    evidence: varchar('evidence', { length: 255 }).notNull(),
    ...timestamps
});

export const resultAk02Header = mysqlTable('result_ak02_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    is_competent: boolean('is_competent').notNull(),
    follow_up: text('follow_up'),
    comment: text('comment'),
    ...timestamps
});

export const resultAk02 = mysqlTable('result_ak02', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultAk02Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    uc_id: int('uc_id').notNull().references(() => ucApl02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    ...timestamps
});

export const ak02Evidence = mysqlTable('ak02_evidence', {
    id: int('id').primaryKey().autoincrement(),
    result_ak02_id: int('result_ak02_id').notNull().references(() => resultAk02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    evidence: varchar('evidence', { length: 255 }).notNull(),
    ...timestamps
});

export const resultAk03Header = mysqlTable('result_ak03_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    comment: varchar('comment', { length: 255 }),
    ...timestamps
});

export const resultAk03 = mysqlTable('result_ak03', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultAk03Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    question: varchar('question', { length: 255 }).notNull(),
    answer: boolean('answer').notNull(),
    comment: varchar('comment', { length: 255 }),
    ...timestamps
});

export const resultAk04 = mysqlTable('result_ak04', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    q1_yes: boolean('q1_yes').notNull(),
    q2_yes: boolean('q2_yes').notNull(),
    q3_yes: boolean('q3_yes').notNull(),
    reason: varchar('reason', { length: 255 }).notNull(),
    ...timestamps
});

export const resultAk05 = mysqlTable('result_ak05', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessor: boolean('approved_assessor').notNull(),
    is_competent: boolean('is_competent').notNull(),
    description: varchar('description', { length: 255 }),
    negative_positive_aspects: varchar('negative_positive_aspects', { length: 255 }),
    rejection_notes: varchar('rejection_notes', { length: 255 }),
    improvement_suggestions: varchar('improvement_suggestions', { length: 255 }),
    notes: varchar('notes', { length: 255 }),
    ...timestamps
});

export const groupIa01 = mysqlTable('group_ia01', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps
});

export const ucIa01 = mysqlTable('uc_ia01', {
    id: int('id').primaryKey().autoincrement(),
    group_id: int('group_id').notNull().references(() => groupIa01.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    unit_code: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    ...timestamps
});

export const elementIa = mysqlTable('element_ia', {
    id: int('id').primaryKey().autoincrement(),
    uc_id: int('uc_id').notNull().references(() => ucIa01.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    ...timestamps
});

export const elementDetailsIa = mysqlTable('element_details_ia', {
    id: int('id').primaryKey().autoincrement(),
    element_id: int('element_id').notNull().references(() => elementIa.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    description: text('description').notNull(),
    benchmark: varchar('benchmark', { length: 255 }).notNull(),
    ...timestamps
});

export const groupIa02 = mysqlTable('group_ia02', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    scenario: text('scenario').notNull(),
    duration: int('duration').notNull(),
    ...timestamps
});

export const ucIa02 = mysqlTable('uc_ia02', {
    id: int('id').primaryKey().autoincrement(),
    group_id: int('group_id').notNull().references(() => groupIa02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    unit_code: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    ...timestamps
});

export const ia02Tool = mysqlTable('ia02_tool', {
    id: int('id').primaryKey().autoincrement(),
    group_id: int('group_id').notNull().references(() => groupIa02.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps
});

export const ia02Pdf = mysqlTable('ia02_pdf', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().unique().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    file_name: varchar('file_name', { length: 255 }).notNull(),
    ...timestamps
});

export const groupIa03 = mysqlTable('group_ia03', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps
});

export const ucIa03 = mysqlTable('uc_ia03', {
    id: int('id').primaryKey().autoincrement(),
    group_id: int('group_id').notNull().references(() => groupIa03.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    unit_code: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    ...timestamps
});

export const resultIa01Header = mysqlTable('result_ia01_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    is_competent: boolean('is_competent').notNull(),
    ...timestamps
});

export const resultIa01 = mysqlTable('result_ia01', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultIa01Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    element_detail_id: int('element_detail_id').notNull().references(() => elementDetailsIa.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    is_competent: boolean('is_competent').notNull(),
    evaluation: text('evaluation').notNull(),
    ...timestamps
}, (table) => ({
    uniqueHeaderElement: unique().on(table.header_id, table.element_detail_id)
}));

export const resultIa02Header = mysqlTable('result_ia02_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    ...timestamps
});

export const ia03Question = mysqlTable('ia03_question', {
    id: int('id').primaryKey().autoincrement(),
    group_id: int('group_id').notNull().references(() => groupIa03.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    question: varchar('question', { length: 255 }).notNull(),
    ...timestamps
});

export const resultIa03Header = mysqlTable('result_ia03_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    ...timestamps
});

export const resultIa03 = mysqlTable('result_ia03', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultIa03Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    question_id: int('question_id').notNull().references(() => ia03Question.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    answer: varchar('answer', { length: 255 }).notNull(),
    approved: boolean('approved').notNull(),
    ...timestamps
}, (table) => ({
    uniqueHeaderQuestion: unique().on(table.header_id, table.question_id)
}));

export const ia05Question = mysqlTable('ia05_question', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    order: int('order').notNull(),
    question: varchar('question', { length: 255 }).notNull(),
    ...timestamps
});

export const questionOption = mysqlTable('question_option', {
    id: int('id').primaryKey().autoincrement(),
    question_id: int('question_id').notNull().references(() => ia05Question.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    option: text('option').notNull(),
    is_answer: boolean('is_answer').notNull(),
    ...timestamps
});

export const resultIa05Header = mysqlTable('result_ia05_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    is_achieved: boolean('is_achieved').notNull(),
    unit: varchar('unit', { length: 255 }),
    element: varchar('element', { length: 255 }),
    kuk: varchar('kuk', { length: 255 }),
    ...timestamps
});

export const resultIa05 = mysqlTable('result_ia05', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultIa05Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    option_id: int('option_id').notNull().references(() => questionOption.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved: boolean('approved').notNull(),
    ...timestamps
}, (table) => ({
    uniqueHeaderOption: unique().on(table.header_id, table.option_id)
}));

export const ia07Question = mysqlTable('ia07_question', {
    id: int('id').primaryKey().autoincrement(),
    assessment_id: int('assessment_id').notNull().references(() => assessment.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    question: text('question').notNull(),
    answer_key: text('answer_key').notNull(),
    ...timestamps
});

export const resultIa07Header = mysqlTable('result_ia07_header', {
    id: int('id').primaryKey().autoincrement(),
    result_id: int('result_id').notNull().unique().references(() => result.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_assessee: boolean('approved_assessee').notNull(),
    approved_assessor: boolean('approved_assessor').notNull(),
    ...timestamps
});

export const resultIa07 = mysqlTable('result_ia07', {
    id: int('id').primaryKey().autoincrement(),
    header_id: int('header_id').notNull().references(() => resultIa07Header.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    question_id: int('question_id').notNull().references(() => ia07Question.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved: boolean('approved').notNull(),
    ...timestamps,
});


export const approvalRequest = mysqlTable('approval_request', {
    id: int('id').primaryKey().autoincrement(),
    requester_admin_id: int('requester_admin_id').notNull().references(() => admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approver_admin_id: int('approver_admin_id').notNull().references(() => admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    backup_admin_id: int('backup_admin_id').references(() => admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    approved_by: int('approved_by').references(() => admin.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    target_table: varchar('target_table', { length: 255 }).notNull(),
    target_id: int('target_id').notNull(),
    target_name: varchar('target_name', { length: 255 }),
    action: varchar('action', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    comment: text('comment'),
    approved_at: datetime('approved_at'),
    ...timestamps
});

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