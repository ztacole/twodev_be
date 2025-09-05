import {
    mysqlTable,
    int,
    boolean,
    varchar,
    text,
    timestamp,
    mysqlEnum,
    unique,
    index,
} from 'drizzle-orm/mysql-core';

// ========= Enums =========
// Note: use inline mysqlEnum in columns to avoid callability typing issues

// ========= Core RBAC & Users =========
export const role = mysqlTable('role', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const user = mysqlTable(
    'user',
    {
        id: int('id').autoincrement().primaryKey(),
        fullName: varchar('full_name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        password: varchar('password', { length: 255 }).notNull(),
        roleId: int('role_id').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        emailUnique: unique('user_email_unique').on(t.email),
        roleIdx: index('user_role_id_idx').on(t.roleId),
    })
);

export const admin = mysqlTable(
    'admin',
    {
        id: int('id').autoincrement().primaryKey(),
        userId: int('user_id').notNull(),
        address: varchar('address', { length: 255 }).notNull(),
        phoneNo: varchar('phone_no', { length: 255 }).notNull(),
        birthDate: timestamp('birth_date', { mode: 'date' }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        userUnique: unique('admin_user_id_unique').on(t.userId),
    })
);

// ========= Master Data =========
export const scheme = mysqlTable('scheme', {
    id: int('id').autoincrement().primaryKey(),
    code: varchar('code', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const occupation = mysqlTable(
    'occupation',
    {
        id: int('id').autoincrement().primaryKey(),
        schemeId: int('scheme_id').notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        schemeIdx: index('occupation_scheme_id_idx').on(t.schemeId),
    })
);

// ========= Personae =========
export const assessor = mysqlTable(
    'assessor',
    {
        id: int('id').autoincrement().primaryKey(),
        userId: int('user_id').notNull(),
        schemeId: int('scheme_id').notNull(),
        noRegMet: varchar('no_reg_met', { length: 255 }).notNull(),
        address: varchar('address', { length: 255 }).notNull(),
        phoneNo: varchar('phone_no', { length: 255 }).notNull(),
        birthDate: timestamp('birth_date', { mode: 'date' }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        userUnique: unique('assessor_user_id_unique').on(t.userId),
        schemeIdx: index('assessor_scheme_id_idx').on(t.schemeId),
    })
);

export const assessorDetail = mysqlTable(
    'assessor_detail',
    {
        id: int('id').autoincrement().primaryKey(),
        assessorId: int('assessor_id').notNull(),
        taxIdNumber: varchar('tax_id_number', { length: 255 }).notNull(),
        bankBookCover: varchar('bank_book_cover', { length: 255 }).notNull(),
        certificate: varchar('certificate', { length: 255 }).notNull(),
        nationalId: varchar('national_id', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        assessorUnique: unique('assessor_detail_assessor_id_unique').on(t.assessorId),
    })
);

export const assessee = mysqlTable('assessee', {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').notNull(),
    identityNumber: varchar('identity_number', { length: 255 }).notNull(),
    birthDate: timestamp('birth_date', { mode: 'date' }).notNull(),
    birthLocation: varchar('birth_location', { length: 255 }).notNull(),
    gender: mysqlEnum('gender', ['male', 'female']).notNull(),
    nationality: varchar('nationality', { length: 255 }).notNull(),
    phoneNo: varchar('phone_no', { length: 255 }).notNull(),
    housePhoneNo: varchar('house_phone_no', { length: 255 }),
    officePhoneNo: varchar('office_phone_no', { length: 255 }),
    address: varchar('address', { length: 255 }).notNull(),
    postalCode: varchar('postal_code', { length: 255 }),
    educationalQualifications: varchar('educational_qualifications', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const assesseeJob = mysqlTable(
    'assessee_job',
    {
        id: int('id').autoincrement().primaryKey(),
        assesseeId: int('assessee_id').notNull(),
        institutionName: varchar('institution_name', { length: 255 }).notNull(),
        address: varchar('address', { length: 255 }).notNull(),
        postalCode: varchar('postal_code', { length: 255 }).notNull(),
        position: varchar('position', { length: 255 }).notNull(),
        phoneNo: varchar('phone_no', { length: 255 }).notNull(),
        jobEmail: varchar('job_email', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        assesseeUnique: unique('assessee_job_assessee_id_unique').on(t.assesseeId),
    })
);

// ========= Assessment (generic) =========
export const assessment = mysqlTable(
    'assessment',
    {
        id: int('id').autoincrement().primaryKey(),
        occupationId: int('occupation_id').notNull(),
        code: varchar('code', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        occupationIdx: index('assessment_occupation_id_idx').on(t.occupationId),
    })
);

export const assessmentSchedule = mysqlTable(
    'assessment_schedule',
    {
        id: int('id').autoincrement().primaryKey(),
        assessmentId: int('assessment_id').notNull(),
        startDate: timestamp('start_date', { mode: 'date' }).notNull(),
        endDate: timestamp('end_date', { mode: 'date' }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        assessmentIdx: index('assessment_schedule_assessment_id_idx').on(t.assessmentId),
    })
);

export const scheduleDetail = mysqlTable('schedule_detail', {
    id: int('id').autoincrement().primaryKey(),
    scheduleId: int('schedule_id').notNull(),
    assessorId: int('assessor_id').notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

// ========= Result (Umum + Dokumen) =========
export const result = mysqlTable('result', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    assessorId: int('assessor_id').notNull(),
    assesseeId: int('assessee_id').notNull(),
    isCompetent: boolean('is_competent').notNull(),
    tuk: mysqlEnum('tuk', ['sewaktu', 'tempat_kerja', 'mandiri']).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultDoc = mysqlTable('result_doc', {
    id: int('id').autoincrement().primaryKey(),
    resultId: int('result_id').notNull(),
    purpose: varchar('purpose', { length: 255 }).notNull(),
    schoolReportCard: varchar('school_report_card', { length: 255 }).notNull(),
    fieldWorkPracticeCertificate: varchar('field_work_practice_certificate', { length: 255 }).notNull(),
    studentCard: varchar('student_card', { length: 255 }).notNull(),
    familyCard: varchar('family_card', { length: 255 }).notNull(),
    idCard: varchar('id_card', { length: 255 }).notNull(),
    approved: boolean('approved').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

// ========= APL02 =========
export const ucApl02 = mysqlTable('uc_apl02', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    unitCode: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const elementApl02 = mysqlTable('element_apl02', {
    id: int('id').autoincrement().primaryKey(),
    ucId: int('uc_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const elementDetailsApl02 = mysqlTable('element_details_apl02', {
    id: int('id').autoincrement().primaryKey(),
    elementId: int('element_id').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultApl02Header = mysqlTable(
    'result_apl02_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        isContinue: boolean('is_continue').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_apl02_header_result_id_unique').on(t.resultId),
    })
);

export const resultApl02 = mysqlTable(
    'result_apl02',
    {
        id: int('id').autoincrement().primaryKey(),
        resultApl02Id: int('result_apl02_id').notNull(),
        elementId: int('element_id').notNull(),
        isCompetent: boolean('is_competent').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        uniq: unique('result_apl02_unique').on(t.resultApl02Id, t.elementId),
    })
);

export const apl02Evidence = mysqlTable('apl02_evidence', {
    id: int('id').autoincrement().primaryKey(),
    resultApl02Id: int('result_apl02_id').notNull(),
    evidence: varchar('evidence', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

// ========= AK01 / AK02 / AK03 / AK04 / AK05 =========
export const resultAk01Header = mysqlTable(
    'result_ak01_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ak01_header_result_id_unique').on(t.resultId),
    })
);

export const resultAk01 = mysqlTable('result_ak01', {
    id: int('id').autoincrement().primaryKey(),
    headerId: int('header_id').notNull(),
    evidence: varchar('evidence', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultAk02Header = mysqlTable(
    'result_ak02_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        isCompetent: boolean('is_competent').notNull(),
        followUp: text('follow_up'),
        comment: text('comment'),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ak02_header_result_id_unique').on(t.resultId),
    })
);

export const resultAk02 = mysqlTable('result_ak02', {
    id: int('id').autoincrement().primaryKey(),
    headerId: int('header_id').notNull(),
    ucId: int('uc_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ak02Evidence = mysqlTable('ak02_evidence', {
    id: int('id').autoincrement().primaryKey(),
    resultAk02Id: int('result_ak02_id').notNull(),
    evidence: varchar('evidence', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultAk03Header = mysqlTable(
    'result_ak03_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        comment: varchar('comment', { length: 255 }),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ak03_header_result_id_unique').on(t.resultId),
    })
);

export const resultAk03 = mysqlTable('result_ak03', {
    id: int('id').autoincrement().primaryKey(),
    headerId: int('header_id').notNull(),
    question: varchar('question', { length: 255 }).notNull(),
    answer: boolean('answer').notNull(),
    comment: varchar('comment', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultAk04 = mysqlTable(
    'result_ak04',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        q1Yes: boolean('q1_yes').notNull(),
        q2Yes: boolean('q2_yes').notNull(),
        q3Yes: boolean('q3_yes').notNull(),
        reason: varchar('reason', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ak04_result_id_unique').on(t.resultId),
    })
);

export const resultAk05 = mysqlTable(
    'result_ak05',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        isCompetent: boolean('is_competent').notNull(),
        description: varchar('description', { length: 255 }),
        negativePositiveAspects: varchar('negative_positive_aspects', { length: 255 }),
        rejectionNotes: varchar('rejection_notes', { length: 255 }),
        improvementSuggestions: varchar('improvement_suggestions', { length: 255 }),
        notes: varchar('notes', { length: 255 }),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ak05_result_id_unique').on(t.resultId),
    })
);

// ========= IA01 Structure =========
export const groupIa01 = mysqlTable('group_ia01', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ucIa01 = mysqlTable('uc_ia01', {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    unitCode: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const elementIa = mysqlTable('element_ia', {
    id: int('id').autoincrement().primaryKey(),
    ucId: int('uc_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const elementDetailsIa = mysqlTable('element_details_ia', {
    id: int('id').autoincrement().primaryKey(),
    elementId: int('element_id').notNull(),
    description: text('description').notNull(),
    benchmark: varchar('benchmark', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultIa01Header = mysqlTable(
    'result_ia01_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        isCompetent: boolean('is_competent').notNull(),
        group: varchar('group', { length: 255 }),
        unit: varchar('unit', { length: 255 }),
        element: varchar('element', { length: 255 }),
        kuk: varchar('kuk', { length: 255 }),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ia01_header_result_id_unique').on(t.resultId),
    })
);

export const resultIa01 = mysqlTable(
    'result_ia01',
    {
        id: int('id').autoincrement().primaryKey(),
        headerId: int('header_id').notNull(),
        elementDetailId: int('element_detail_id').notNull(),
        isCompetent: boolean('is_competent').notNull(),
        evaluation: text('evaluation').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        uniq: unique('result_ia01_unique').on(t.headerId, t.elementDetailId),
    })
);

// ========= IA02 (header saja) =========
export const resultIa02Header = mysqlTable(
    'result_ia02_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ia02_header_result_id_unique').on(t.resultId),
    })
);

// ========= IA03 =========
export const groupIa03 = mysqlTable('group_ia03', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ucIa03 = mysqlTable('uc_ia03', {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    unitCode: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ia03Question = mysqlTable('ia03_question', {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    question: varchar('question', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultIa03Header = mysqlTable(
    'result_ia03_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ia03_header_result_id_unique').on(t.resultId),
    })
);

export const resultIa03 = mysqlTable(
    'result_ia03',
    {
        id: int('id').autoincrement().primaryKey(),
        headerId: int('header_id').notNull(),
        questionId: int('question_id').notNull(),
        answer: varchar('answer', { length: 255 }).notNull(),
        approved: boolean('approved').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        uniq: unique('result_ia03_unique').on(t.headerId, t.questionId),
    })
);

// ========= IA05 (PG) =========
export const ia05Question = mysqlTable('ia05_question', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    order: int('order').notNull(),
    question: varchar('question', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const questionOption = mysqlTable('question_option', {
    id: int('id').autoincrement().primaryKey(),
    questionId: int('question_id').notNull(),
    option: text('option').notNull(),
    isAnswer: boolean('is_answer').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultIa05Header = mysqlTable(
    'result_ia05_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        isAchieved: boolean('is_achieved').notNull(),
        unit: varchar('unit', { length: 255 }),
        element: varchar('element', { length: 255 }),
        kuk: varchar('kuk', { length: 255 }),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ia05_header_result_id_unique').on(t.resultId),
    })
);

export const resultIa05 = mysqlTable(
    'result_ia05',
    {
        id: int('id').autoincrement().primaryKey(),
        headerId: int('header_id').notNull(),
        optionId: int('option_id').notNull(),
        approved: boolean('approved').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        uniq: unique('result_ia05_unique').on(t.headerId, t.optionId),
    })
);

// ========= IA02 grouping/tools/pdfs =========
export const groupIa02 = mysqlTable('group_ia02', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    scenario: text('scenario').notNull(),
    duration: int('duration').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ucIa02 = mysqlTable('uc_ia02', {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    unitCode: varchar('unit_code', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ia02Tool = mysqlTable('ia02_tool', {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const ia02Pdf = mysqlTable(
    'ia02_pdf',
    {
        id: int('id').autoincrement().primaryKey(),
        groupId: int('group_id').notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        groupUnique: unique('ia02_pdf_group_id_unique').on(t.groupId),
    })
);

// ========= IA07 =========
export const ia07Question = mysqlTable('ia07_question', {
    id: int('id').autoincrement().primaryKey(),
    assessmentId: int('assessment_id').notNull(),
    question: text('question').notNull(),
    answerKey: text('answer_key').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const resultIa07Header = mysqlTable(
    'result_ia07_header',
    {
        id: int('id').autoincrement().primaryKey(),
        resultId: int('result_id').notNull(),
        approvedAssessee: boolean('approved_assessee').notNull(),
        approvedAssessor: boolean('approved_assessor').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
    },
    (t) => ({
        resultUnique: unique('result_ia07_header_result_id_unique').on(t.resultId),
    })
);

export const resultIa07 = mysqlTable('result_ia07', {
    id: int('id').autoincrement().primaryKey(),
    headerId: int('header_id').notNull(),
    questionId: int('question_id').notNull(),
    approved: boolean('approved').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
