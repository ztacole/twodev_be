import { DuplicateEntryError, NotFoundError } from '../../common/error';
import { prisma } from '../../config/db';
import {
    AssesseeResponse,
    AssesseeRequest,
} from './assessee.type';

export class AssesseeService {
    static async getAssesses(): Promise<AssesseeResponse[]> {
        const assessees = await prisma.assessee.findMany({
            include: {
                jobs: true,
            },
        });

        return assessees.map(this.formatAssesseeResponse);
    }

    static async getAssesseById(id: number): Promise<AssesseeResponse> {
        const assessee = await prisma.assessee.findUnique({ 
            where: { id },
            include: {
                jobs: true,
            },
        });

        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        return this.formatAssesseeResponse(assessee);
    }

    static async getAssesseByUserId(userId: number): Promise<AssesseeResponse> {
        const assessee = await prisma.assessee.findUnique({ 
            where: { user_id: userId },
            include: {
                jobs: true,
            },
        });

        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        return this.formatAssesseeResponse(assessee);
    }

    static async createAssesse(data: AssesseeRequest): Promise<AssesseeResponse> {
        let gender: 'Male' | 'Female' | undefined;
        switch (data.gender.trim().toLowerCase()) {
            case 'laki-laki':
                gender = 'Male';
                break;
            case 'perempuan':
                gender = 'Female';
                break;
        }

        const existingAssessee = await prisma.assessee.findFirst({
            where: {
                identity_number: data.identity_number
            }
        });

        if (existingAssessee) {
            throw new DuplicateEntryError('Identity number', data.identity_number);
        }

        const { jobs, ...assesseeData } = data;
        
        const jobsData = jobs && jobs.length > 0 ? {
            create: jobs.map(job => ({
                institution_name: job.institution_name,
                address: job.address,
                position: job.position,
                phone_no: job.phone_no,
                postal_code: job.postal_code ?? '',
                job_email: job.job_email ?? ''
            }))
        } : undefined;

        const assessee = await prisma.assessee.create({
            data: {
                ...assesseeData,
                gender: gender as any,
                birth_date: new Date(assesseeData.birth_date),
                jobs: jobsData
            },
            include: { 
                jobs: true 
            }
        });

        return this.formatAssesseeResponse(assessee);
    }

    static async updateAssesse(id: number, data: AssesseeRequest): Promise<AssesseeResponse> {
        let gender: 'Male' | 'Female' | undefined;
        switch (data.gender.trim().toLowerCase()) {
            case 'laki-laki':
                gender = 'Male';
                break;
            case 'perempuan':
                gender = 'Female';
                break;
        }

        const existingAssessee = await prisma.assessee.findUnique({
            where: { id }
        });

        if (!existingAssessee) {
            throw new NotFoundError('Assessee');
        }

        if (data.identity_number !== existingAssessee.identity_number) {
            const duplicateAssessee = await prisma.assessee.findFirst({
                where: {
                    identity_number: data.identity_number,
                    NOT: { id }
                }
            });

            if (duplicateAssessee) {
                throw new DuplicateEntryError('Identity number', data.identity_number);
            }
        }

        const { jobs, ...assesseeData } = data;
        
        await prisma.assessee.update({
            where: { id },
            data: {
                ...assesseeData,
                gender: gender as any,
                birth_date: new Date(assesseeData.birth_date)
            },
        });

        if (jobs) {
            const oldJobs = await prisma.assessee_Job.findMany({ 
                where: { assessee_id: id } 
            });
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
                            postal_code: job.postal_code,
                            job_email: job.job_email
                        },
                    });
                } else {
                    const created = await prisma.assessee_Job.create({
                        data: {
                            institution_name: job.institution_name,
                            address: job.address,
                            position: job.position,
                            phone_no: job.phone_no,
                            postal_code: job.postal_code ?? '',
                            job_email: job.job_email ?? '',
                            assessee_id: id,
                        },
                    });
                    matchedOldJobIds.push(created.id);
                }
            }

            const jobsToDelete = oldJobs.filter(j => !matchedOldJobIds.includes(j.id)).map(j => j.id);
            if (jobsToDelete.length > 0) {
                await prisma.assessee_Job.deleteMany({ 
                    where: { id: { in: jobsToDelete } } 
                });
            }
        }

        const updatedAssessee = await prisma.assessee.findUnique({
            where: { id },
            include: { 
                jobs: true 
            },
        });

        if (!updatedAssessee) {
            throw new NotFoundError('Assessee');
        }

        return this.formatAssesseeResponse(updatedAssessee);
    }

    static async deleteAssesse(id: number): Promise<void> {
        const assessee = await prisma.assessee.findUnique({
            where: { id }
        });

        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        await prisma.assessee_Job.deleteMany({ 
            where: { assessee_id: id } 
        });
        await prisma.assessee.delete({ 
            where: { id } 
        });
    }

    private static formatAssesseeResponse(assessee: any): AssesseeResponse {
        return {
            id: assessee.id,
            user_id: assessee.user_id,
            full_name: assessee.full_name,
            identity_number: assessee.identity_number,
            birth_date: assessee.birth_date,
            birth_location: assessee.birth_location,
            gender: assessee.gender,
            nationality: assessee.nationality,
            phone_no: assessee.phone_no,
            house_phone_no: assessee.house_phone_no,
            office_phone_no: assessee.office_phone_no,
            address: assessee.address,
            postal_code: assessee.postal_code,
            educational_qualifications: assessee.educational_qualifications,
            jobs: assessee.jobs.map((job: any) => ({
                id: job.id,
                assessee_id: job.assessee_id,
                institution_name: job.institution_name,
                address: job.address,
                position: job.position,
                phone_no: job.phone_no,
                postal_code: job.postal_code,
                job_email: job.job_email
            }))
        };
    }
}