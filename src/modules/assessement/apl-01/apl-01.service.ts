import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import {
    AssesseeResponse,
    AssesseeJobResponse,
    CertificateDocsResponse,
    AssesseeRequest,
    AssesseeJobRequest,
    CertificateDocsRequest
} from './apl-01.type';

const TUK_VALUES = {
    SEWAKTU: 'sewaktu',
    TEMPAT_KERJA: 'tempat_kerja',
    MANDIRI: 'mandiri'
} as const;

export class APL1Service {
    static async createOrUpdateAssessee(data: AssesseeRequest): Promise<AssesseeResponse> {
        const { jobs, id, user_id, ...assesseeData } = data;
        
        let gender: any = assesseeData.gender.trim().toLowerCase();
        if (gender === 'Laki-laki') {
            gender = 'Male';
        } else if (gender === 'Perempuan') {
            gender = 'Female';
        }

        const existingAssessee = await prisma.assessee.findFirst({
            where: {
                OR: [
                    { user_id: user_id },
                    { identity_number: assesseeData.identity_number }
                ]
            }
        });

        if (existingAssessee && !id) {
            throw new DuplicateEntryError('Assessee', `User ID: ${user_id} or Identity Number: ${assesseeData.identity_number}`);
        }

        if (id) {
            const updatedAssessee = await prisma.assessee.update({
                where: { id },
                data: {
                    ...assesseeData,
                    gender,
                    birth_date: new Date(assesseeData.birth_date).toISOString(),
                    jobs: jobs && jobs.length > 0 ? {
                        deleteMany: {},
                        create: jobs
                    } : undefined
                },
                include: { 
                    jobs: true 
                }
            });

            return {
                ...updatedAssessee,
                jobs: updatedAssessee.jobs
            } as AssesseeResponse;
        } else {
            const newAssessee = await prisma.assessee.create({
                data: {
                    user_id,
                    ...assesseeData,
                    gender,
                    birth_date: new Date(assesseeData.birth_date).toISOString(),
                    jobs: jobs && jobs.length > 0 ? {
                        create: jobs
                    } : undefined
                },
                include: { 
                    jobs: true 
                }
            });

            return {
                ...newAssessee,
                jobs: newAssessee.jobs
            } as AssesseeResponse;
        }
    }

    static async getAssesseeJobsByAssesseeId(assesseeId: number): Promise<AssesseeJobResponse[]> {
        const assessee = await prisma.assessee.findUnique({
            where: { id: assesseeId },
            include: { jobs: true }
        });
        
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        return assessee.jobs;
    }

    static async createAssesseeCertificate(data: CertificateDocsRequest): Promise<CertificateDocsResponse> {
        const { assessee_id, assessor_id, ...docsData } = data;
        
        let result = await prisma.result.findFirst({
            where: { assessee_id }
        });
        
        if (!result) {
            const assessment = await prisma.assessment.findFirst();
            if (!assessment) {
                throw new NotFoundError('Assessment');
            }
            
            result = await prisma.result.create({
                data: {
                    assessment_id: assessment.id,
                    assessee_id,
                    assessor_id: assessor_id,
                    tuk: TUK_VALUES.SEWAKTU,
                    approved: false
                }
            });
        }
        
        const existingDocs = await prisma.result_doc.findFirst({
            where: {
                result_id: result.id,
            }
        });
        
        if (existingDocs) {
            const updatedDocs = await prisma.result_doc.update({
                where: { id: existingDocs.id },
                data: {
                    ...docsData,
                    approved: false
                }
            });

            return updatedDocs as CertificateDocsResponse;
        } else {
            const newDocs = await prisma.result_doc.create({
                data: {
                    result_id: result.id,
                    purpose: docsData.purpose || 'APL1 Certificate Documents',
                    approved: false,
                    school_report_card: docsData.school_report_card || '',
                    field_work_practice_certificate: docsData.field_work_practice_certificate || '',
                    student_card: docsData.student_card || '',
                    family_card: docsData.family_card || '',
                    id_card: docsData.id_card || ''
                }
            });

            return newDocs as CertificateDocsResponse;
        }
    }

    static async uploadCertificateDocs(assessorId: number, assesseeId: number, files: any[]): Promise<CertificateDocsResponse> {
        const uploadPath = `apl1/${assessorId}`;
        const fileData: any = {};
        
        const fieldMapping: { [key: string]: string } = {
            school_report_card: 'school_report_card',
            field_work_practice_certificate: 'field_work_practice_certificate',
            student_card: 'student_card',
            family_card: 'family_card',
            id_card: 'id_card'
        };
        
        for (const file of files) {
            if (fieldMapping[file.fieldname]) {
                fileData[fieldMapping[file.fieldname]] = `${uploadPath}/${file.filename}`;
            }
        }
        
        let result = await prisma.result.findFirst({
            where: { assessee_id: assesseeId }
        });
        
        if (!result) {
            const assessment = await prisma.assessment.findFirst();
            if (!assessment) {
                throw new NotFoundError('Assessment');
            }
            
            result = await prisma.result.create({
                data: {
                    assessment_id: assessment.id,
                    assessee_id: assesseeId,
                    assessor_id: assessorId,
                    tuk: TUK_VALUES.SEWAKTU,
                    approved: false
                }
            });
        }
        
        const existingDocs = await prisma.result_doc.findFirst({
            where: {
                result_id: result.id,
            }
        });
        
        if (existingDocs) {
            const updatedDocs = await prisma.result_doc.update({
                where: { id: existingDocs.id },
                data: {
                    ...fileData,
                    approved: false
                }
            });

            return updatedDocs as CertificateDocsResponse;
        } else {
            const newDocs = await prisma.result_doc.create({
                data: {
                    result_id: result.id,
                    purpose: 'APL1 Certificate Documents',
                    approved: false,
                    ...fileData
                }
            });

            return newDocs as CertificateDocsResponse;
        }
    }
}