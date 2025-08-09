import { prisma } from '../../../config/db';

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
    return prisma.result_Docs.create({
        data: {
        assessee_id,
        assessor_id,
        ...docsData
        },
    });
    }

}