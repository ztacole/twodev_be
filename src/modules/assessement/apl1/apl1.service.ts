import { prisma } from '../../../config/db';
import path from 'path';

export class APL1Service {
    async createOrUpdateAssesse(data: any) {
        const { jobs, id, user_id, ...assesseeData } = data;
    
        if (!id && !user_id) {
            return prisma.assessee.create({
                data: {
                    user_id,
                    ...assesseeData,
                    jobs: jobs && jobs.length > 0 ? {
                        create: jobs
                    } : undefined
                },
                include: { jobs: true }
            });
        }
    
        return prisma.assessee.upsert({
            where: id ? { id } : { user_id },
            update: {
                ...assesseeData,
                jobs: jobs && jobs.length > 0 ? {
                    deleteMany: {},
                    createMany: { data: jobs }
                } : undefined
            },
            create: {
                user_id,
                ...assesseeData,
                jobs: jobs && jobs.length > 0 ? {
                    create: jobs
                } : undefined
            },
            include: { jobs: true }
        });
    }
    

    async getAssesseJobsByAssesseeId(assesseeId: number) {
        return prisma.assessee_Job.findMany({
            where: { assessee_id: assesseeId }
        });
    }

    async createAssesseCertificate(data: any) {
        const { assessee_id, assessor_id, ...docsData } = data;
        
        const existingDocs = await prisma.result_Docs.findFirst({
            where: {
                assessor_id: assessor_id,
                result: {
                    assessee_id: assessee_id
                }
            }
        });
        
        if (existingDocs) {
            return prisma.result_Docs.update({
                where: { id: existingDocs.id },
                data: {
                    ...docsData
                }
            });
        } else {
            return prisma.result_Docs.create({
                data: {
                    result: {
                        create: {
                            assessee_id: assessee_id,
                            approved: false,
                            assessment_id: (await prisma.assessment.findFirst())?.id || 1
                        }
                    },
                    assessor_id: assessor_id,
                    purpose: 'APL1 Certificate Documents',
                    ...docsData
                }
            });
        }
    }

    async uploadCertificateDocs(assessorId: number, assesseeId: number, files: any) {
        const uploadPath = `apl1/${assessorId}`;
        
        const fileData: any = {};
        
        if (files) {
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
        }
        
        const existingDocs = await prisma.result_Docs.findFirst({
            where: {
                assessor_id: assessorId,
                result: {
                    assessee_id: assesseeId
                }
            }
        });
        
        if (existingDocs) {
            return prisma.result_Docs.update({
                where: { id: existingDocs.id },
                data: {
                    ...fileData
                }
            });
        } else {
            let result = await prisma.result.findFirst({
                where: {
                    assessee_id: assesseeId
                }
            });
            
            if (!result) {
                const assessment = await prisma.assessment.findFirst();
                
                if (assessment) {
                    result = await prisma.result.create({
                        data: {
                            assessment_id: assessment.id,
                            assessee_id: assesseeId,
                            approved: false
                        }
                    });
                } else {
                    return prisma.result_Docs.create({
                        data: {
                            result: {
                                create: {
                                    assessee_id: assesseeId,
                                    approved: false,
                                    assessment_id: 1 // Default to ID 1 if no assessments exist
                                }
                            },
                            assessor_id: assessorId,
                            purpose: 'APL1 Certificate Documents',
                            ...fileData
                        }
                    });
                }
            }
            
            return prisma.result_Docs.create({
                data: {
                    result_id: result.id,
                    assessor_id: assessorId,
                    purpose: 'APL1 Certificate Documents',
                    ...fileData
                }
            });
        }
    }

}