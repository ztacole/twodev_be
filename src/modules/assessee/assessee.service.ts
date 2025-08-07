import { prisma } from '../../config/db';

export class AssesseeService {
    async getAssesses() {
        return prisma.assessee.findMany({
            include: {
                jobs: true,
            },
        });
    }
  
    async getAssesseById(id: number) {
        return prisma.assessee.findUnique({ 
            where: { id },
            include: {
                jobs: true,
            },
        });
    };

    async createAssesse(data: any) {
        const { jobs, ...assesseeData } = data;
        return prisma.assessee.create({
            data: {
                ...assesseeData,
                jobs: jobs && jobs.length > 0 ? {
                    create: jobs
                } : undefined
            },
            include: { jobs: true }
        });
    }

    async updateAssesse(id: number, data: any) {
        const { jobs, ...assesseeData } = data;
        await prisma.assessee.update({
            where: { id },
            data: assesseeData,
        });

        if (jobs) {
            const oldJobs = await prisma.assessee_Job.findMany({ where: { assessee_id: id } });
            let matchedOldJobIds: number[] = [];

            for (const job of jobs) {
                const existingJob = oldJobs.find(j =>
                    j.institution_name === job.institution_name &&
                    j.position === job.position &&
                    j.phone_no === job.phone_no
                );
                if (existingJob) {
                    matchedOldJobIds.push(existingJob.id);
                    await prisma.assessee_Job.update({
                        where: { id: existingJob.id },
                        data: {
                            institution_name: job.institution_name,
                            address: job.address,
                            position: job.position,
                            phone_no: job.phone_no,
                        },
                    });
                } else {
                    const created = await prisma.assessee_Job.create({
                        data: {
                            ...job,
                            assessee_id: id,
                        },
                    });
                    matchedOldJobIds.push(created.id);
                }
            }

            const jobsToDelete = oldJobs.filter(j => !matchedOldJobIds.includes(j.id)).map(j => j.id);
            if (jobsToDelete.length > 0) {
                await prisma.assessee_Job.deleteMany({ where: { id: { in: jobsToDelete } } });
            }
        }

        return prisma.assessee.findUnique({
            where: { id },
            include: { jobs: true },
        });
    }

    async deleteAssesse(id: number) {
        await prisma.assessee_Job.deleteMany({ where: { assessee_id: id } });
        return prisma.assessee.delete({ where: { id } });
    }
}