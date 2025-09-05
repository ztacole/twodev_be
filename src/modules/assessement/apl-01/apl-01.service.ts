import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { db } from '../../../config/drizzle';
import {
    user as userTable,
    assessee as assesseeTable,
    assesseeJob as assesseeJobTable,
    result as resultTable,
    assessment as assessmentTable,
    resultDoc as resultDocTable,
    resultApl02Header as apl02HeaderTable,
    resultIa01Header as ia01HeaderTable,
    resultIa02Header as ia02HeaderTable,
    resultIa03Header as ia03HeaderTable,
    resultIa05Header as ia05HeaderTable,
    resultIa07Header as ia07HeaderTable,
    resultAk01Header as ak01HeaderTable,
    resultAk02Header as ak02HeaderTable,
} from '../../../../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';
import {
    AssesseeResponse,
    AssesseeJobResponse,
    CertificateDocsResponse,
    AssesseeRequest,
    AssesseeJobRequest,
    CertificateDocsRequest,
    ResultDocResponse
} from './apl-01.type';

const TUK_VALUES = {
    SEWAKTU: 'sewaktu',
    TEMPAT_KERJA: 'tempat_kerja',
    MANDIRI: 'mandiri'
} as const;

export class APL1Service {
    static async createOrUpdateAssessee(data: AssesseeRequest): Promise<AssesseeResponse> {
        const { jobs, id, user_id, full_name, ...assesseeData } = data;

        let gender: any = (assesseeData.gender || '').trim().toLowerCase();
        if (gender === 'laki-laki') gender = 'male';
        else if (gender === 'perempuan') gender = 'female';

        if (full_name) {
            await db.update(userTable).set({ fullName: full_name }).where(eq(userTable.id, user_id));
        }

        if (id) {
            // update assessee
            await db.update(assesseeTable)
                .set({
                    userId: user_id,
                    identityNumber: assesseeData.identity_number,
                    gender,
                    birthDate: new Date(assesseeData.birth_date) as any,
                    birthLocation: assesseeData.birth_location,
                    nationality: assesseeData.nationality,
                    phoneNo: assesseeData.phone_no,
                    housePhoneNo: assesseeData.house_phone_no as any,
                    officePhoneNo: assesseeData.office_phone_no as any,
                    address: assesseeData.address,
                    postalCode: assesseeData.postal_code as any,
                    educationalQualifications: assesseeData.educational_qualifications,
                })
                .where(eq(assesseeTable.id, id));

            // replace jobs
            if (jobs && jobs.length > 0) {
                await db.delete(assesseeJobTable).where(eq(assesseeJobTable.assesseeId, id));
                for (const j of jobs) {
                    await db.insert(assesseeJobTable).values({
                        assesseeId: id,
                        institutionName: (j as any).institution_name,
                        address: (j as any).address,
                        postalCode: (j as any).postal_code,
                        position: (j as any).position,
                        phoneNo: (j as any).phone_no,
                        jobEmail: (j as any).job_email,
                    });
                }
            }

            const updated = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
            if (!updated) throw new NotFoundError('Assessee');

            const u = await db.query.user.findFirst({ where: eq(userTable.id, updated.userId) });
            const jobsData = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assesseeId, updated.id));
            return { ...(updated as any), full_name: u?.fullName, jobs: jobsData } as AssesseeResponse;
        } else {
            // create assessee
            const [created] = await db.insert(assesseeTable).values({
                userId: user_id,
                identityNumber: assesseeData.identity_number,
                gender,
                birthDate: new Date(assesseeData.birth_date) as any,
                birthLocation: assesseeData.birth_location,
                nationality: assesseeData.nationality,
                phoneNo: assesseeData.phone_no,
                housePhoneNo: assesseeData.house_phone_no as any,
                officePhoneNo: assesseeData.office_phone_no as any,
                address: assesseeData.address,
                postalCode: assesseeData.postal_code as any,
                educationalQualifications: assesseeData.educational_qualifications,
            });

            // fetch created (ambil berdasarkan userId)
            const createdAssessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.userId, user_id) });
            if (!createdAssessee) throw new NotFoundError('Assessee');

            if (jobs && jobs.length > 0) {
                for (const j of jobs) {
                    await db.insert(assesseeJobTable).values({
                        assesseeId: createdAssessee.id,
                        institutionName: (j as any).institution_name,
                        address: (j as any).address,
                        postalCode: (j as any).postal_code,
                        position: (j as any).position,
                        phoneNo: (j as any).phone_no,
                        jobEmail: (j as any).job_email,
                    });
                }
            }

            const u = await db.query.user.findFirst({ where: eq(userTable.id, createdAssessee.userId) });
            const jobsData = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assesseeId, createdAssessee.id));
            return { ...(createdAssessee as any), full_name: u?.fullName, jobs: jobsData } as AssesseeResponse;
        }
    }

    static async getAssesseeJobsByAssesseeId(assesseeId: number): Promise<AssesseeJobResponse[]> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, assesseeId) });
        if (!assessee) throw new NotFoundError('Assessee');
        const jobs = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assesseeId, assesseeId));
        return jobs as any;
    }

    static async createOrUploadCertificate(params: {
        assesseeId: number;
        assessorId: number;
        assessmentId: number;
        bodyData: any;
        files: any[];
    }): Promise<CertificateDocsResponse> {
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
        const fieldMapping: Record<string, string> = {};
        for (const f of canonicalFields) {
            fieldMapping[f] = f;
            const camel = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            fieldMapping[camel] = f;
        }

        // initialize fileData with empty string fallback (DB may be NOT NULL)
        const fileData: Record<string, string> = {};
        for (const canonical of canonicalFields) fileData[canonical] = '';

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

        const docsData: any = {
            purpose: bodyData?.purpose || 'APL1 Certificate Documents',
            ...fileData
        };

        // find latest result
        let results = await db.select().from(resultTable)
            .where(and(eq(resultTable.assesseeId, assesseeId), eq(resultTable.assessorId, assessorId), eq(resultTable.assessmentId, assessmentId)))
            .orderBy(desc(resultTable.id));

        let resultRow = results[0] || null;

        if (!resultRow) {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessmentId) });
            if (!assessment) throw new NotFoundError('Assessment');

            await db.insert(resultTable).values({
                assessmentId,
                assesseeId,
                assessorId,
                tuk: TUK_VALUES.SEWAKTU as any,
                isCompetent: false,
            });

            const found = await db.query.result.findFirst({
                where: and(eq(resultTable.assessmentId, assessmentId), eq(resultTable.assessorId, assessorId), eq(resultTable.assesseeId, assesseeId))
            });
            if (!found) throw new NotFoundError('Result');
            resultRow = found as any;

            // create headers
            await db.insert(apl02HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isContinue: false });
            await db.insert(ia01HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isCompetent: false });
            await db.insert(ia02HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
            await db.insert(ia03HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
            await db.insert(ia05HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isAchieved: false });
            await db.insert(ia07HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
            await db.insert(ak01HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
            await db.insert(ak02HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isCompetent: false });
        }

        // existing docs?
        const existingDocs = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.resultId, resultRow.id) });

        if (existingDocs) {
            await db.update(resultDocTable).set({
                purpose: docsData.purpose,
                schoolReportCard: docsData.school_report_card,
                fieldWorkPracticeCertificate: docsData.field_work_practice_certificate,
                studentCard: docsData.student_card,
                familyCard: docsData.family_card,
                idCard: docsData.id_card
            }).where(eq(resultDocTable.id, existingDocs.id));

            // fetch updated doc
            const updated = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.id, existingDocs.id) });
            // build full result nested
            const fullResult = await APL1Service._buildFullResult(resultRow.id);
            return { ...(updated as any), result: fullResult } as CertificateDocsResponse;
        } else {
            // create new doc
            const [ins] = await db.insert(resultDocTable).values({
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
            const created = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.resultId, resultRow.id) });
            const fullResult = await APL1Service._buildFullResult(resultRow.id);
            return { ...(created as any), result: fullResult } as CertificateDocsResponse;
        }
    }

    // helper untuk membangun nested result object mirip Prisma include
    private static async _buildFullResult(resultId: number) {
        const resultRow = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
        if (!resultRow) return null;

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, resultRow.assessmentId) });
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, resultRow.assesseeId) });
        const assessor = await db.query.user.findFirst({ where: eq(userTable.id, resultRow.assessorId) })
        // if assessor stored in separate table, adapt accordingly

        // headers
        const apl02_headers = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.resultId, resultId) });
        const ia01_headers = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.resultId, resultId) });
        const ia02_headers = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.resultId, resultId) });
        const ia03_headers = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.resultId, resultId) });
        const ia05_headers = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.resultId, resultId) });
        const ia07_headers = await db.query.resultIa07Header.findFirst({ where: eq(ia07HeaderTable.resultId, resultId) });
        const ak01_headers = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.resultId, resultId) });
        const ak02_headers = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.resultId, resultId) });

        return {
            ...(resultRow as any),
            assessment: assessment || null,
            assessee: assessee || null,
            assessor: assessor || null,
            apl02_headers: apl02_headers || null,
            ia01_headers: ia01_headers || null,
            ia02_headers: ia02_headers || null,
            ia03_headers: ia03_headers || null,
            ia05_headers: ia05_headers || null,
            ia07_headers: ia07_headers || null,
            ak01_headers: ak01_headers || null,
            ak02_headers: ak02_headers || null,
        };
    }

    static async getAllResultDoc(): Promise<ResultDocResponse[]> {
        const docs = await db.select().from(resultDocTable);
        return docs as any;
    }

    static async getResultDocsByAssessmentId(assessmentId: number): Promise<ResultDocResponse[]> {
        // ambil semua result ids untuk assessment
        const results = await db.select().from(resultTable).where(eq(resultTable.assessmentId, assessmentId));
        const ids = new Set(results.map(r => r.id));
        const docs = await db.select().from(resultDocTable);
        return (docs.filter(d => ids.has(d.resultId)) as any);
    }

    static async getResultDocsByAssessorId(assessorId: number): Promise<ResultDocResponse[]> {
        const results = await db.select().from(resultTable).where(eq(resultTable.assesseeId, assessorId));
        const ids = new Set(results.map(r => r.id));
        const docs = await db.select().from(resultDocTable);
        return (docs.filter(d => ids.has(d.resultId)) as any);
    }

    static async getUnapprovedResultDoc(): Promise<ResultDocResponse[]> {
        const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.approved, false));
        return docs as any;
    }

    static async approveResultDoc(resultId: number): Promise<ResultDocResponse> {
        await db.update(resultDocTable).set({ approved: true }).where(eq(resultDocTable.id, resultId));
        const updated = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.id, resultId) });
        return updated as any;
    }
}
