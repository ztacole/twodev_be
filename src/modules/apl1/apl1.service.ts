import { prisma } from '../../config/db';

export class APL1Service {
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

  async createAssesseJob(data: any) {
      const { assessee_id, ...jobData } = data;
      return prisma.assessee_Job.create({
          data: {
              assessee_id,
              ...jobData,
          }
      });
  }
}