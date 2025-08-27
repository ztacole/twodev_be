import { DuplicateEntryError, NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
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

        let gender: any = assesseeData.gender.trim().toLowerCase();
        if (gender === 'laki-laki') {
            gender = 'male';
        } else if (gender === 'perempuan') {
            gender = 'female';
        }

        if (full_name) {
            await prisma.user.update({
                where: { id: user_id },
                data: { full_name }
            });
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
                    user: true,
                    jobs: true
                }
            });

            return {
                ...updatedAssessee,
                full_name: updatedAssessee.user.full_name,
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
                    user: true,
                    jobs: true
                }
            });

            return {
                ...newAssessee,
                full_name: newAssessee.user.full_name,
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

    static async createOrUploadCertificate(params: {
        assesseeId: number;
        assessorId: number;
        assessmentId: number;
        bodyData: any;
        files: any[];
    }): Promise<CertificateDocsResponse> {
        const { assesseeId, assessorId, assessmentId, bodyData, files } = params;

        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

        const fieldMapping: { [key: string]: string } = {
            school_report_card: 'school_report_card',
            field_work_practice_certificate: 'field_work_practice_certificate',
            student_card: 'student_card',
            family_card: 'family_card',
            id_card: 'id_card'
        };

        const fileData: any = {};
        for (const file of files) {
            if (fieldMapping[file.fieldname]) {
                fileData[fieldMapping[file.fieldname]] = `${BASE_URL}/uploads/apl-01/${assesseeId}_${assessorId}_${assessmentId}/${file.filename}`;
            }
        }

        const docsData: any = {
            purpose: bodyData.purpose || 'APL1 Certificate Documents',
            ...fileData
        };

        let results = await prisma.result.findMany({
            where: {
                assessee_id: assesseeId,
                assessor_id: assessorId,
                assessment_id: assessmentId
            },
            take: 1,
            orderBy: { id: 'desc' },
            include: {
                assessment: true,
                assessee: true,
                assessor: true,
                apl02_headers: true,
                ia01_headers: true,
                ia02_headers: true,
                ia03_headers: true,
                ia05_headers: true,
                ia07_headers: true,
                ak01_headers: true,
                ak02_headers: true
            }
        });

        let result = results[0] || null;

        if (!result) {
            const assessment = await prisma.assessment.findUnique({
                where: { id: assessmentId }
            });
            if (!assessment) {
                throw new NotFoundError('Assessment');
            }

            result = await prisma.result.create({
                data: {
                    assessment_id: assessmentId,
                    assessee_id: assesseeId,
                    assessor_id: assessorId,
                    tuk: TUK_VALUES.SEWAKTU,
                    is_competent: false,
                    apl02_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                            is_continue: false
                        }
                    },
                    ia01_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                            is_competent: false
                        }
                    },
                    ia02_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ia03_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ia05_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ia07_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ak01_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ak02_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                            is_competent: false
                        }
                    }
                },
                include: {
                    assessment: true,
                    assessee: true,
                    assessor: true,
                    apl02_headers: true,
                    ia01_headers: true,
                    ia02_headers: true,
                    ia03_headers: true,
                    ia05_headers: true,
                    ia07_headers: true,
                    ak01_headers: true,
                    ak02_headers: true
                }
            });
        }

        if (!result.apl02_headers) {
            result = await prisma.result.update({
                where: { id: result.id },
                data: {
                    apl02_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                            is_continue: false
                        }
                    },
                    ia01_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                            is_competent: false
                        }
                    },
                    ia02_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ia03_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ia05_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ia07_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ak01_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                        }
                    },
                    ak02_headers: {
                        create: {
                            approved_assessee: false,
                            approved_assessor: false,
                            is_competent: false
                        }
                    }
                },
                include: {
                    assessment: true,
                    assessee: true,
                    assessor: true,
                    apl02_headers: true,
                    ia01_headers: true,
                    ia02_headers: true,
                    ia03_headers: true,
                    ia05_headers: true,
                    ia07_headers: true,
                    ak01_headers: true,
                    ak02_headers: true
                }
            });
        }

        const existingDocs = await prisma.result_doc.findFirst({
            where: { result_id: result.id }
        });

        if (existingDocs) {
            return await prisma.result_doc.update({
                where: { id: existingDocs.id },
                data: { ...docsData },
                include: {
                    result: {
                        include: {
                            assessment: true,
                            assessee: true,
                            assessor: true,
                            apl02_headers: true,
                            ia01_headers: true,
                            ia02_headers: true,
                            ia03_headers: true,
                            ia05_headers: true,
                            ia07_headers: true,
                            ak01_headers: true,
                            ak02_headers: true
                        }
                    }
                }
            }) as CertificateDocsResponse;
        } else {
            return await prisma.result_doc.create({
                data: {
                    result_id: result.id,
                    approved: false,
                    ...docsData
                },
                include: {
                    result: {
                        include: {
                            assessment: true,
                            assessee: true,
                            assessor: true,
                            apl02_headers: true,
                            ia01_headers: true,
                            ia02_headers: true,
                            ia03_headers: true,
                            ia05_headers: true,
                            ia07_headers: true,
                            ak01_headers: true,
                            ak02_headers: true
                        }
                    }
                }
            });
        }
    }

    static async getAllResultDoc(): Promise<ResultDocResponse[]> {
        const result_doc = await prisma.result_doc.findMany({
            include: {
                result: {
                    include: {
                        assessment: true,
                        assessee: true
                    }
                }
            }
        });
        return result_doc;
    }

    static async getResultDocsByAssessmentId(assessmentId: number): Promise<ResultDocResponse[]> {
        const result_doc = await prisma.result_doc.findMany({
            where: { result: { assessment_id: assessmentId } },
            include: {
                result: {
                    include: {
                        assessment: true,
                        assessee: true
                    }
                }
            }
        });
        return result_doc;
    }

    static async getResultDocsByAssessorId(assessorId: number): Promise<ResultDocResponse[]> {
        const result_doc = await prisma.result_doc.findMany({
            where: { result: { assessee_id: assessorId } },
            include: {
                result: {
                    include: {
                        assessment: true,
                        assessee: true
                    }
                }
            }
        });
        return result_doc;
    }

    static async getUnapprovedResultDoc(): Promise<ResultDocResponse[]> {
        const result_doc = await prisma.result_doc.findMany({
            where: { approved: false },
            include: {
                result: {
                    include: {
                        assessment: true,
                        assessee: true
                    }
                }
            }
        });
        return result_doc;
    }
    static async approveResultDoc(resultId: number): Promise<ResultDocResponse> {
        const result_doc = await prisma.result_doc.update({
            where: { id: resultId },
            data: { approved: true }
        });
        return result_doc;
    }
}