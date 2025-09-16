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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APL1Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const TUK_VALUES = {
    SEWAKTU: 'sewaktu',
    TEMPAT_KERJA: 'tempat_kerja',
    MANDIRI: 'mandiri'
};
class APL1Service {
    static createOrUpdateAssessee(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jobs, id, user_id, full_name } = data, assesseeData = __rest(data, ["jobs", "id", "user_id", "full_name"]);
            const existingUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, user_id) });
            if (!existingUser)
                throw new error_1.NotFoundError('User');
            let gender = (assesseeData.gender || '').trim().toLowerCase();
            if (gender === 'laki-laki')
                gender = 'male';
            else if (gender === 'perempuan')
                gender = 'female';
            if (full_name) {
                yield drizzle_1.db.update(schema_1.user).set({ full_name: full_name }).where((0, drizzle_orm_1.eq)(schema_1.user.id, user_id));
            }
            if (id) {
                // update assessee
                yield drizzle_1.db.update(schema_1.assessee)
                    .set({
                    user_id: user_id,
                    identity_number: assesseeData.identity_number,
                    gender,
                    birth_date: new Date(assesseeData.birth_date),
                    birth_location: assesseeData.birth_location,
                    nationality: assesseeData.nationality,
                    phone_no: assesseeData.phone_no,
                    house_phone_no: assesseeData.house_phone_no,
                    office_phone_no: assesseeData.office_phone_no,
                    address: assesseeData.address,
                    postal_code: assesseeData.postal_code,
                    educational_qualifications: assesseeData.educational_qualifications,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.assessee.id, id));
                // replace jobs
                if (jobs && jobs.length > 0) {
                    yield drizzle_1.db.delete(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, id));
                    for (const j of jobs) {
                        yield drizzle_1.db.insert(schema_1.assesseeJob).values({
                            assessee_id: id,
                            institution_name: j.institution_name,
                            address: j.address,
                            postal_code: j.postal_code,
                            position: j.position,
                            phone_no: j.phone_no,
                            job_email: j.job_email,
                        });
                    }
                }
                const updated = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, id) });
                if (!updated)
                    throw new error_1.NotFoundError('Assessee');
                const u = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, updated.user_id) });
                const jobsData = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, updated.id));
                return Object.assign(Object.assign({}, updated), { full_name: u === null || u === void 0 ? void 0 : u.full_name, jobs: jobsData });
            }
            else {
                // create assessee
                const [createdAssessee] = yield drizzle_1.db.insert(schema_1.assessee).values({
                    user_id: user_id,
                    identity_number: assesseeData.identity_number,
                    gender,
                    birth_date: new Date(assesseeData.birth_date),
                    birth_location: assesseeData.birth_location,
                    nationality: assesseeData.nationality,
                    phone_no: assesseeData.phone_no,
                    house_phone_no: assesseeData.house_phone_no,
                    office_phone_no: assesseeData.office_phone_no,
                    address: assesseeData.address,
                    postal_code: assesseeData.postal_code,
                    educational_qualifications: assesseeData.educational_qualifications,
                }).$returningId();
                if (jobs && jobs.length > 0) {
                    for (const j of jobs) {
                        yield drizzle_1.db.insert(schema_1.assesseeJob).values({
                            assessee_id: createdAssessee.id,
                            institution_name: j.institution_name,
                            address: j.address,
                            postal_code: j.postal_code,
                            position: j.position,
                            phone_no: j.phone_no,
                            job_email: j.job_email,
                        });
                    }
                }
                const u = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, user_id) });
                const jobsData = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, createdAssessee.id));
                return Object.assign(Object.assign({}, createdAssessee), { full_name: u === null || u === void 0 ? void 0 : u.full_name, jobs: jobsData });
            }
        });
    }
    static getAssesseeJobsByAssessee_id(assessee_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, assessee_id) });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            const jobs = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, assessee_id));
            return jobs;
        });
    }
    static createOrUploadCertificate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assessee_id, assessor_id, assessment_id, bodyData, files } = params;
            const BASE_URL = window.location.origin;
            // canonical fields and mapping (auto generate camelCase -> snake_case)
            const canonicalFields = [
                'school_report_card',
                'field_work_practice_certificate',
                'student_card',
                'family_card',
                'id_card',
            ];
            const fieldMapping = {};
            for (const f of canonicalFields) {
                fieldMapping[f] = f;
                const camel = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                fieldMapping[camel] = f;
            }
            // initialize fileData with empty string fallback (DB may be NOT NULL)
            const fileData = {};
            for (const canonical of canonicalFields)
                fileData[canonical] = '';
            // fill fileData from uploaded files
            const fileArray = Array.isArray(files) ? files : [];
            for (const file of fileArray) {
                const mapped = fieldMapping[file.fieldname];
                if (mapped) {
                    fileData[mapped] = `${BASE_URL}/twodev/uploads/apl-01/${assessee_id}_${assessor_id}_${assessment_id}/${file.filename}`;
                }
            }
            // fallback: accept text URL in body too
            for (const key of Object.keys(bodyData || {})) {
                const mapped = fieldMapping[key];
                if (mapped && bodyData[key]) {
                    fileData[mapped] = bodyData[key];
                }
            }
            const docsData = Object.assign({ purpose: (bodyData === null || bodyData === void 0 ? void 0 : bodyData.purpose) || 'APL1 Certificate Documents' }, fileData);
            // find latest result
            let results = yield drizzle_1.db.select().from(schema_1.result)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessee_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.result.id));
            let resultRow = results[0] || null;
            if (!resultRow) {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
                if (!assessment)
                    throw new error_1.NotFoundError('Assessment');
                yield drizzle_1.db.insert(schema_1.result).values({
                    assessment_id,
                    assessee_id,
                    assessor_id,
                    tuk: TUK_VALUES.SEWAKTU,
                    is_competent: false,
                });
                const found = yield drizzle_1.db.query.result.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessee_id))
                });
                if (!found)
                    throw new error_1.NotFoundError('result');
                resultRow = found;
                // create headers
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
            // existing docs?
            const existingDocs = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, resultRow.id) });
            if (existingDocs) {
                yield drizzle_1.db.update(schema_1.resultDoc).set({
                    purpose: docsData.purpose,
                    school_report_card: docsData.school_report_card,
                    field_work_practice_certificate: docsData.field_work_practice_certificate,
                    student_card: docsData.student_card,
                    family_card: docsData.family_card,
                    id_card: docsData.id_card
                }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, existingDocs.id));
                // fetch updated doc
                const updated = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, existingDocs.id) });
                // build full result nested
                const fullresult = yield APL1Service._buildFullresult(resultRow.id);
                return Object.assign(Object.assign({}, updated), { result: fullresult });
            }
            else {
                // create new doc
                const [ins] = yield drizzle_1.db.insert(schema_1.resultDoc).values({
                    result_id: resultRow.id,
                    approved: false,
                    purpose: docsData.purpose,
                    school_report_card: docsData.school_report_card,
                    field_work_practice_certificate: docsData.field_work_practice_certificate,
                    student_card: docsData.student_card,
                    family_card: docsData.family_card,
                    id_card: docsData.id_card
                });
                // fetch created doc (by result_id)
                const created = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, resultRow.id) });
                const fullresult = yield APL1Service._buildFullresult(resultRow.id);
                return Object.assign(Object.assign({}, created), { result: fullresult });
            }
        });
    }
    // helper untuk membangun nested result object mirip Prisma include
    static _buildFullresult(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultRow = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!resultRow)
                return null;
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, resultRow.assessment_id) });
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, resultRow.assessee_id) });
            const assessor = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, resultRow.assessor_id) });
            // if assessor stored in separate table, adapt accordingly
            // headers
            const apl02_headers = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            const ia01_headers = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result_id) });
            const ia02_headers = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result_id) });
            const ia03_headers = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result_id) });
            const ia05_headers = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result_id) });
            const ia07_headers = yield drizzle_1.db.query.resultIa07Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa07Header.result_id, result_id) });
            const ak01_headers = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, result_id) });
            const ak02_headers = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result_id) });
            return Object.assign(Object.assign({}, resultRow), { assessment: assessment || null, assessee: assessee || null, assessor: assessor || null, apl02_headers: apl02_headers || null, ia01_headers: ia01_headers || null, ia02_headers: ia02_headers || null, ia03_headers: ia03_headers || null, ia05_headers: ia05_headers || null, ia07_headers: ia07_headers || null, ak01_headers: ak01_headers || null, ak02_headers: ak02_headers || null });
        });
    }
    static getAllResultDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc);
            return docs;
        });
    }
    static getResultDocsByAssessmentId(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield drizzle_1.db
                .select({
                id: schema_1.resultDoc.id,
                result_id: schema_1.resultDoc.result_id,
                approved: schema_1.resultDoc.approved,
                purpose: schema_1.resultDoc.purpose,
                school_report_card: schema_1.resultDoc.school_report_card,
                field_work_practice_certificate: schema_1.resultDoc.field_work_practice_certificate,
                student_card: schema_1.resultDoc.student_card,
                family_card: schema_1.resultDoc.family_card,
                id_card: schema_1.resultDoc.id_card,
                created_at: schema_1.resultDoc.created_at,
                updated_at: schema_1.resultDoc.updated_at,
                result: schema_1.result,
                assessment: schema_1.assessment,
                assessee: schema_1.assessee
            })
                .from(schema_1.resultDoc)
                .innerJoin(schema_1.result, (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, schema_1.result.id))
                .innerJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schema_1.assessment.id))
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .where((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessmentId));
            return rows;
        });
    }
    static getResultDocsByAssessorId(assessor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessor_id));
            const ids = new Set(results.map(r => r.id));
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc);
            return docs.filter(d => ids.has(d.result_id));
        });
    }
    static getUnapprovedResultDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select({
                id: schema_1.resultDoc.id,
                result_id: schema_1.resultDoc.result_id,
                approved: schema_1.resultDoc.approved,
                purpose: schema_1.resultDoc.purpose,
                school_report_card: schema_1.resultDoc.school_report_card,
                field_work_practice_certificate: schema_1.resultDoc.field_work_practice_certificate,
                student_card: schema_1.resultDoc.student_card,
                family_card: schema_1.resultDoc.family_card,
                id_card: schema_1.resultDoc.id_card,
                created_at: schema_1.resultDoc.created_at,
                updated_at: schema_1.resultDoc.updated_at,
                assessee: {
                    id: schema_1.assessee.id,
                    user_id: schema_1.assessee.user_id,
                    name: schema_1.user.full_name,
                    email: schema_1.user.email,
                }
            })
                .from(schema_1.resultDoc)
                .innerJoin(schema_1.result, (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, schema_1.result.id))
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .innerJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.eq)(schema_1.resultDoc.approved, false));
            return results;
        });
    }
    static approveResultDoc(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield drizzle_1.db.update(schema_1.resultDoc).set({ approved: true }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, result_id));
            const updated = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, result_id) });
            return updated;
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) });
            const assesseeJobs = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, assessee.id));
            if (assesseeJobs.length === 0)
                throw new error_1.NotFoundError('Assessee Jobs');
            const assesseeJob = assesseeJobs[0];
            return Object.assign(Object.assign({}, assessee), { full_name: user === null || user === void 0 ? void 0 : user.full_name, jobs: assesseeJob });
        });
    }
    static getResultDocsByResultId(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result_id) });
            if (!docs)
                throw new error_1.NotFoundError('Certificate Docs');
            return docs;
        });
    }
}
exports.APL1Service = APL1Service;
