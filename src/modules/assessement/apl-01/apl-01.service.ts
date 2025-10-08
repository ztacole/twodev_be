import { DuplicateEntryError, NotFoundError, ValidationError } from '../../../common/error';
import { db } from '../../../config/drizzle';
import {
    user as userTable,
    admin as adminTable,
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
    resultAk03Header,
    resultAk04,
    resultAk05,
    result,
    assessment,
    assessee,
    assessor,
} from '../../../../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';
import {
    AssesseeResponse,
    AssesseeJobResponse,
    CertificateDocsResponse,
    AssesseeRequest,
    AssesseeJobRequest,
    CertificateDocsRequest,
} from './apl-01.type';
import { w } from '@faker-js/faker/dist/airline-CLphikKp';
import fs from 'fs';
import { AssessmentService } from '../assessment.service';

const TUK_VALUES = {
    SEWAKTU: 'sewaktu',
    TEMPAT_KERJA: 'tempat_kerja',
    MANDIRI: 'mandiri'
} as const;

export class APL1Service {
    static async createOrUpdateAssessee(data: AssesseeRequest): Promise<AssesseeResponse> {
        const { jobs, id, user_id, full_name, ...assesseeData } = data;

        const existingUser = await db.query.user.findFirst({ where: eq(userTable.id, user_id) });
        if (!existingUser) throw new NotFoundError('User');

        let gender: any = (assesseeData.gender || '').trim().toLowerCase();
        if (gender === 'laki-laki') gender = 'male';
        else if (gender === 'perempuan') gender = 'female';

        if (full_name) {
            await db.update(userTable).set({ full_name: full_name }).where(eq(userTable.id, user_id));
        }

        if (id) {
            // update assessee
            await db.update(assesseeTable)
                .set({
                    user_id: user_id,
                    identity_number: assesseeData.identity_number,
                    gender,
                    birth_date: new Date(assesseeData.birth_date) as any,
                    birth_location: assesseeData.birth_location,
                    nationality: assesseeData.nationality,
                    phone_no: assesseeData.phone_no,
                    house_phone_no: assesseeData.house_phone_no as any,
                    office_phone_no: assesseeData.office_phone_no as any,
                    address: assesseeData.address,
                    postal_code: assesseeData.postal_code as any,
                    educational_qualifications: assesseeData.educational_qualifications,
                })
                .where(eq(assesseeTable.id, id));

            // replace jobs
            if (jobs && jobs.length > 0) {
                await db.delete(assesseeJobTable).where(eq(assesseeJobTable.assessee_id, id));
                for (const j of jobs) {
                    await db.insert(assesseeJobTable).values({
                        assessee_id: id,
                        institution_name: (j as any).institution_name,
                        address: (j as any).address,
                        postal_code: (j as any).postal_code,
                        position: (j as any).position,
                        phone_no: (j as any).phone_no,
                        job_email: (j as any).job_email,
                    });
                }
            }

            const updated = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
            if (!updated) throw new NotFoundError('Assessee');

            const u = await db.query.user.findFirst({ where: eq(userTable.id, updated.user_id) });
            const [jobsData] = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assessee_id, updated.id));
            return { ...(updated as any), full_name: u?.full_name, job: jobsData } as AssesseeResponse;
        } else {
            // create assessee
            const [createdAssessee] = await db.insert(assesseeTable).values({
                user_id: user_id,
                identity_number: assesseeData.identity_number,
                gender,
                birth_date: new Date(assesseeData.birth_date) as any,
                birth_location: assesseeData.birth_location,
                nationality: assesseeData.nationality,
                phone_no: assesseeData.phone_no,
                house_phone_no: assesseeData.house_phone_no as any,
                office_phone_no: assesseeData.office_phone_no as any,
                address: assesseeData.address,
                postal_code: assesseeData.postal_code as any,
                educational_qualifications: assesseeData.educational_qualifications,
            }).$returningId();

            if (jobs && jobs.length > 0) {
                for (const j of jobs) {
                    await db.insert(assesseeJobTable).values({
                        assessee_id: createdAssessee.id,
                        institution_name: (j as any).institution_name,
                        address: (j as any).address,
                        postal_code: (j as any).postal_code,
                        position: (j as any).position,
                        phone_no: (j as any).phone_no,
                        job_email: (j as any).job_email,
                    });
                }
            }

            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, createdAssessee.id) });

            const u = await db.query.user.findFirst({ where: eq(userTable.id, user_id) });
            const [jobsData] = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assessee_id, createdAssessee.id));
            return { ...(assessee as any), full_name: u?.full_name, job: jobsData } as AssesseeResponse;
        }
    }

    static async getAssesseeJobsByAssessee_id(assessee_id: number): Promise<AssesseeJobResponse[]> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, assessee_id) });
        if (!assessee) throw new NotFoundError('Assessee');
        const jobs = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assessee_id, assessee_id));
        return jobs as any;
    }

    static async createOrUploadCertificate(params: {
        assessee_id: number;
        assessor_id: number;
        assessment_id: number;
        bodyData: any;
        files: any[];
    }): Promise<CertificateDocsResponse> {
    const { assessee_id, assessor_id, assessment_id, bodyData, files } = params;

    if (!assessee_id) throw new ValidationError('assessee_id');
    if (!assessor_id) throw new ValidationError('assessor_id');
    if (!assessment_id) throw new ValidationError('assessment_id');

    const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessment_id) });
    if (!existingAssessment) throw new NotFoundError('Assessment');

    const existingAssessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, assessee_id) });
    if (!existingAssessee) throw new NotFoundError('Assessee');

    const existingAssessor = await db.query.assessor.findFirst({ where: eq(assessor.id, assessor_id) });
    if (!existingAssessor) throw new NotFoundError('Assessor');

    const BASE_URL = "https://asessment24.site/twodev";
    const uploadPath = require('path').join(__dirname, '../../../../public/uploads/apl-01', `${assessee_id}_${assessor_id}_${assessment_id}`);

        const canonicalFields = [
            'school_report_card',
            'field_work_practice_certificate',
            'student_card',
            'family_card',
            'id_card',
        ];

        if (canonicalFields.length !== 5) throw new NotFoundError('files');
        
        const fieldMapping: Record<string, string> = {};
        for (const f of canonicalFields) {
            fieldMapping[f] = f;
            const camel = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            fieldMapping[camel] = f;
        }

        const fileData: Record<string, string> = {};
        for (const canonical of canonicalFields) fileData[canonical] = '';

        const fileArray = Array.isArray(files) ? files : [];
        if (fileArray.length < 5) {
            const fs = require('fs');
            if (fs.existsSync(uploadPath)) {
                for (const fileName of fs.readdirSync(uploadPath)) {
                    const filePath = require('path').join(uploadPath, fileName);
                    try { fs.unlinkSync(filePath); } catch {}
                }
            }
            throw new ValidationError('File belum lengkap. Upload gagal, silakan ulangi.');
        }
        for (const file of fileArray) {
            const mapped = fieldMapping[file.fieldname];
            if (mapped) {
                fileData[mapped] = `${BASE_URL}/uploads/apl-01/${assessee_id}_${assessor_id}_${assessment_id}/${file.filename}`;
            }
        }

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
        let [result] = await db.select().from(resultTable)
            .where(and(eq(resultTable.assessee_id, assessee_id), eq(resultTable.assessor_id, assessor_id), eq(resultTable.assessment_id, assessment_id)))
            .orderBy(desc(resultTable.id));

        if (!result) {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessment_id) });
            if (!assessment) throw new NotFoundError('Assessment');

            const [createdResult] = await db.insert(resultTable).values({
                assessment_id,
                assessee_id,
                assessor_id,
                tuk: TUK_VALUES.SEWAKTU as any,
                is_competent: false,
            }).$returningId();

            const found = await db.query.result.findFirst({
                where: and(eq(resultTable.id, createdResult.id)),
            });
            if (!found) throw new NotFoundError('result');
            result = found as any;

            // create headers
            await db.insert(apl02HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false, is_continue: false });
            await db.insert(ia01HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false, is_competent: false });
            await db.insert(ia02HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false });
            await db.insert(ia03HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false });
            await db.insert(ia05HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false, is_achieved: false });
            // await db.insert(ia07HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false });
            await db.insert(ak01HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false });
            await db.insert(ak02HeaderTable).values({ result_id: result.id, approved_assessee: false, approved_assessor: false, is_competent: false });
            await db.insert(resultAk03Header).values({ result_id: result.id });
            await db.insert(resultAk04).values({ result_id: result.id, approved_assessee: false, q1_yes: false, q2_yes: false, q3_yes: false, reason: "" });
            await db.insert(resultAk05).values({ result_id: result.id, approved_assessor: false, is_competent: false });
        }

        // existing docs?
        const existingDocs = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result.id) });

        if (existingDocs) {
            await db.update(resultDocTable).set({
                purpose: docsData.purpose,
                school_report_card: docsData.school_report_card,
                field_work_practice_certificate: docsData.field_work_practice_certificate,
                student_card: docsData.student_card,
                family_card: docsData.family_card,
                id_card: docsData.id_card
            }).where(eq(resultDocTable.id, existingDocs.id));

            // fetch updated doc
            const updated = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.id, existingDocs.id) });
            // build full result nested
            const fullresult = await APL1Service._buildFullresult(result.id);
            return { ...(updated as any), result: fullresult } as CertificateDocsResponse;
        } else {
            // create new doc
            const [ins] = await db.insert(resultDocTable).values({
                result_id: result.id,
                approved: false,
                purpose: docsData.purpose,
                school_report_card: docsData.school_report_card,
                field_work_practice_certificate: docsData.field_work_practice_certificate,
                student_card: docsData.student_card,
                family_card: docsData.family_card,
                id_card: docsData.id_card
            }).$returningId();

            // fetch created doc (by result_id)
            const created = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, ins.id) });
            const fullresult = await APL1Service._buildFullresult(result.id);
            return { ...(created as any), result: fullresult } as CertificateDocsResponse;
        }
    }

    // helper untuk membangun nested result object mirip Prisma include
    private static async _buildFullresult(result_id: number) {
        const resultRow = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!resultRow) return null;

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, resultRow.assessment_id) });
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, resultRow.assessee_id) });
        const assessor = await db.query.user.findFirst({ where: eq(userTable.id, resultRow.assessor_id) })
        // if assessor stored in separate table, adapt accordingly

        // headers
        const apl02_headers = await db.query.resultApl02Header.findFirst({ where: eq(apl02HeaderTable.result_id, result_id) });
        const ia01_headers = await db.query.resultIa01Header.findFirst({ where: eq(ia01HeaderTable.result_id, result_id) });
        const ia02_headers = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.result_id, result_id) });
        const ia03_headers = await db.query.resultIa03Header.findFirst({ where: eq(ia03HeaderTable.result_id, result_id) });
        const ia05_headers = await db.query.resultIa05Header.findFirst({ where: eq(ia05HeaderTable.result_id, result_id) });
        const ia07_headers = await db.query.resultIa07Header.findFirst({ where: eq(ia07HeaderTable.result_id, result_id) });
        const ak01_headers = await db.query.resultAk01Header.findFirst({ where: eq(ak01HeaderTable.result_id, result_id) });
        const ak02_headers = await db.query.resultAk02Header.findFirst({ where: eq(ak02HeaderTable.result_id, result_id) });

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

    static async getAllResultDoc(): Promise<any[]> {
        const docs = await db.select().from(resultDocTable);
        return docs as any;
    }

    static async getResultDocsByAssessmentId(assessmentId: number) {
        const rows = await db
            .select({
                id: resultDocTable.id,
                admin_id: resultDocTable.admin_id,
                result_id: resultDocTable.result_id,
                approved: resultDocTable.approved,
                purpose: resultDocTable.purpose,
                school_report_card: resultDocTable.school_report_card,
                field_work_practice_certificate: resultDocTable.field_work_practice_certificate,
                student_card: resultDocTable.student_card,
                family_card: resultDocTable.family_card,
                id_card: resultDocTable.id_card,
                created_at: resultDocTable.created_at,
                updated_at: resultDocTable.updated_at,
                result: result,
                assessment: assessment,
                assessee: assessee
            })
            .from(resultDocTable)
            .innerJoin(result, eq(resultDocTable.result_id, result.id))
            .innerJoin(assessment, eq(result.assessment_id, assessment.id))
            .innerJoin(assessee, eq(result.assessee_id, assessee.id))
            .where(eq(result.assessment_id, assessmentId));

        return rows;
    }

    static async getResultDocsByAssessorId(assessor_id: number): Promise<any[]> {
        const results = await db.select().from(resultTable).where(eq(resultTable.assessee_id, assessor_id));
        const ids = new Set(results.map(r => r.id));
        const docs = await db.select().from(resultDocTable);
        return (docs.filter(d => ids.has(d.result_id)) as any);
    }

    static async getUnapprovedResultDoc(): Promise<any[]> {
        const results = await db.select({
            id: resultDocTable.id,
            admin_id: resultDocTable.admin_id,
            result_id: resultDocTable.result_id,
            approved: resultDocTable.approved,
            purpose: resultDocTable.purpose,
            school_report_card: resultDocTable.school_report_card,
            field_work_practice_certificate: resultDocTable.field_work_practice_certificate,
            student_card: resultDocTable.student_card,
            family_card: resultDocTable.family_card,
            id_card: resultDocTable.id_card,
            created_at: resultDocTable.created_at,
            updated_at: resultDocTable.updated_at,
            assessee: {
                id: assessee.id,
                user_id: assessee.user_id,
                name: userTable.full_name,
                email: userTable.email,
            }
        })
            .from(resultDocTable)
            .innerJoin(result, eq(resultDocTable.result_id, result.id))
            .innerJoin(assessee, eq(result.assessee_id, assessee.id))
            .innerJoin(userTable, eq(assessee.user_id, userTable.id))
            .where(eq(resultDocTable.approved, false));
        return results as any;
    }

    static async approveResultDoc(result_id: number, user_id: number): Promise<any> {
        const admin = await db.query.admin.findFirst({ where: eq(adminTable.user_id, user_id) });
        if (!admin) throw new NotFoundError('Admin');
        await db.update(resultDocTable).set({ admin_id: admin.id, approved: true }).where(eq(resultDocTable.id, result_id));
        const updated = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.id, result_id) });
        return updated as any;
    }

    static async getResultDetails(result_id: number): Promise<AssesseeResponse> {
        const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!result) throw new NotFoundError('Result');

        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
        if (!assessee) throw new NotFoundError('Assessee');
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) });
        const assesseeJobs = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assessee_id, assessee.id));
        if (assesseeJobs.length === 0) throw new NotFoundError('Assessee Jobs');
        const assesseeJob = assesseeJobs[0];

        const assessment = await AssessmentService.getAssessmentById(result.assessment_id);

        return {
            ...(assessee as any),
            full_name: user?.full_name,
            job: assesseeJob,
            assessment: assessment,
        } as AssesseeResponse;
    }

    static async getResultDocsByResultId(result_id: number): Promise<CertificateDocsResponse> {
        const docs = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result_id) });
        if (!docs) throw new NotFoundError('Certificate Docs');
        return docs as CertificateDocsResponse;
    }
}
