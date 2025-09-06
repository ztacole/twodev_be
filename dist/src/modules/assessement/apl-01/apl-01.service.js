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
            let gender = (assesseeData.gender || '').trim().toLowerCase();
            if (gender === 'laki-laki')
                gender = 'male';
            else if (gender === 'perempuan')
                gender = 'female';
            if (full_name) {
                yield drizzle_1.db.update(schema_1.user).set({ fullName: full_name }).where((0, drizzle_orm_1.eq)(schema_1.user.id, user_id));
            }
            if (id) {
                // update assessee
                yield drizzle_1.db.update(schema_1.assessee)
                    .set({
                    userId: user_id,
                    identityNumber: assesseeData.identity_number,
                    gender,
                    birthDate: new Date(assesseeData.birth_date),
                    birthLocation: assesseeData.birth_location,
                    nationality: assesseeData.nationality,
                    phoneNo: assesseeData.phone_no,
                    housePhoneNo: assesseeData.house_phone_no,
                    officePhoneNo: assesseeData.office_phone_no,
                    address: assesseeData.address,
                    postalCode: assesseeData.postal_code,
                    educationalQualifications: assesseeData.educational_qualifications,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.assessee.id, id));
                // replace jobs
                if (jobs && jobs.length > 0) {
                    yield drizzle_1.db.delete(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assesseeId, id));
                    for (const j of jobs) {
                        yield drizzle_1.db.insert(schema_1.assesseeJob).values({
                            assesseeId: id,
                            institutionName: j.institution_name,
                            address: j.address,
                            postalCode: j.postal_code,
                            position: j.position,
                            phoneNo: j.phone_no,
                            jobEmail: j.job_email,
                        });
                    }
                }
                const updated = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, id) });
                if (!updated)
                    throw new error_1.NotFoundError('Assessee');
                const u = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, updated.userId) });
                const jobsData = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assesseeId, updated.id));
                return Object.assign(Object.assign({}, updated), { full_name: u === null || u === void 0 ? void 0 : u.fullName, jobs: jobsData });
            }
            else {
                // create assessee
                const [created] = yield drizzle_1.db.insert(schema_1.assessee).values({
                    userId: user_id,
                    identityNumber: assesseeData.identity_number,
                    gender,
                    birthDate: new Date(assesseeData.birth_date),
                    birthLocation: assesseeData.birth_location,
                    nationality: assesseeData.nationality,
                    phoneNo: assesseeData.phone_no,
                    housePhoneNo: assesseeData.house_phone_no,
                    officePhoneNo: assesseeData.office_phone_no,
                    address: assesseeData.address,
                    postalCode: assesseeData.postal_code,
                    educationalQualifications: assesseeData.educational_qualifications,
                });
                // fetch created (ambil berdasarkan userId)
                const createdAssessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.userId, user_id) });
                if (!createdAssessee)
                    throw new error_1.NotFoundError('Assessee');
                if (jobs && jobs.length > 0) {
                    for (const j of jobs) {
                        yield drizzle_1.db.insert(schema_1.assesseeJob).values({
                            assesseeId: createdAssessee.id,
                            institutionName: j.institution_name,
                            address: j.address,
                            postalCode: j.postal_code,
                            position: j.position,
                            phoneNo: j.phone_no,
                            jobEmail: j.job_email,
                        });
                    }
                }
                const u = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, createdAssessee.userId) });
                const jobsData = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assesseeId, createdAssessee.id));
                return Object.assign(Object.assign({}, createdAssessee), { full_name: u === null || u === void 0 ? void 0 : u.fullName, jobs: jobsData });
            }
        });
    }
    static getAssesseeJobsByAssesseeId(assesseeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, assesseeId) });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            const jobs = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assesseeId, assesseeId));
            return jobs;
        });
    }
    static createOrUploadCertificate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assesseeId, assessorId, assessmentId, bodyData, files } = params;
            const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
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
                    fileData[mapped] = `${BASE_URL}/uploads/apl-01/${assesseeId}_${assessorId}_${assessmentId}/${file.filename}`;
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
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assesseeId, assesseeId), (0, drizzle_orm_1.eq)(schema_1.result.assessorId, assessorId), (0, drizzle_orm_1.eq)(schema_1.result.assessmentId, assessmentId)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.result.id));
            let resultRow = results[0] || null;
            if (!resultRow) {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessmentId) });
                if (!assessment)
                    throw new error_1.NotFoundError('Assessment');
                yield drizzle_1.db.insert(schema_1.result).values({
                    assessmentId,
                    assesseeId,
                    assessorId,
                    tuk: TUK_VALUES.SEWAKTU,
                    isCompetent: false,
                });
                const found = yield drizzle_1.db.query.result.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessmentId, assessmentId), (0, drizzle_orm_1.eq)(schema_1.result.assessorId, assessorId), (0, drizzle_orm_1.eq)(schema_1.result.assesseeId, assesseeId))
                });
                if (!found)
                    throw new error_1.NotFoundError('Result');
                resultRow = found;
                // create headers
                yield drizzle_1.db.insert(schema_1.resultApl02Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isContinue: false });
                yield drizzle_1.db.insert(schema_1.resultIa01Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isCompetent: false });
                yield drizzle_1.db.insert(schema_1.resultIa02Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
                yield drizzle_1.db.insert(schema_1.resultIa03Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
                yield drizzle_1.db.insert(schema_1.resultIa05Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isAchieved: false });
                yield drizzle_1.db.insert(schema_1.resultIa07Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
                yield drizzle_1.db.insert(schema_1.resultAk01Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
                yield drizzle_1.db.insert(schema_1.resultAk02Header).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isCompetent: false });
            }
            // existing docs?
            const existingDocs = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.resultId, resultRow.id) });
            if (existingDocs) {
                yield drizzle_1.db.update(schema_1.resultDoc).set({
                    purpose: docsData.purpose,
                    schoolReportCard: docsData.school_report_card,
                    fieldWorkPracticeCertificate: docsData.field_work_practice_certificate,
                    studentCard: docsData.student_card,
                    familyCard: docsData.family_card,
                    idCard: docsData.id_card
                }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, existingDocs.id));
                // fetch updated doc
                const updated = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, existingDocs.id) });
                // build full result nested
                const fullResult = yield APL1Service._buildFullResult(resultRow.id);
                return Object.assign(Object.assign({}, updated), { result: fullResult });
            }
            else {
                // create new doc
                const [ins] = yield drizzle_1.db.insert(schema_1.resultDoc).values({
                    resultId: resultRow.id,
                    approved: false,
                    purpose: docsData.purpose,
                    schoolReportCard: docsData.school_report_card,
                    fieldWorkPracticeCertificate: docsData.field_work_practice_certificate,
                    studentCard: docsData.student_card,
                    familyCard: docsData.family_card,
                    idCard: docsData.id_card
                });
                // fetch created doc (by resultId)
                const created = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.resultId, resultRow.id) });
                const fullResult = yield APL1Service._buildFullResult(resultRow.id);
                return Object.assign(Object.assign({}, created), { result: fullResult });
            }
        });
    }
    // helper untuk membangun nested result object mirip Prisma include
    static _buildFullResult(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultRow = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!resultRow)
                return null;
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, resultRow.assessmentId) });
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, resultRow.assesseeId) });
            const assessor = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, resultRow.assessorId) });
            // if assessor stored in separate table, adapt accordingly
            // headers
            const apl02_headers = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, resultId) });
            const ia01_headers = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, resultId) });
            const ia02_headers = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.resultId, resultId) });
            const ia03_headers = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.resultId, resultId) });
            const ia05_headers = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.resultId, resultId) });
            const ia07_headers = yield drizzle_1.db.query.resultIa07Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa07Header.resultId, resultId) });
            const ak01_headers = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, resultId) });
            const ak02_headers = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.resultId, resultId) });
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
            // ambil semua result ids untuk assessment
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.eq)(schema_1.result.assessmentId, assessmentId));
            const ids = new Set(results.map(r => r.id));
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc);
            return docs.filter(d => ids.has(d.resultId));
        });
    }
    static getResultDocsByAssessorId(assessorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.eq)(schema_1.result.assesseeId, assessorId));
            const ids = new Set(results.map(r => r.id));
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc);
            return docs.filter(d => ids.has(d.resultId));
        });
    }
    static getUnapprovedResultDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.approved, false));
            return docs;
        });
    }
    static approveResultDoc(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield drizzle_1.db.update(schema_1.resultDoc).set({ approved: true }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, resultId));
            const updated = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, resultId) });
            return updated;
        });
    }
}
exports.APL1Service = APL1Service;
